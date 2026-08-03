import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { TodayVisit } from '@/models/Client';
import { clientRepository } from '@/repositories/implementations/ClientRepository';
import { runOrQueue } from '@/services/sync/syncEngine';
import type { Coordinates } from '@/shared/utils/geo';

/**
 * Hooks de dados das telas de Clientes, isolando-as de React Query
 * diretamente — mesmo padrão de `screens/home/useHomeData.ts`.
 */
export function useClientPortfolio(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['client-portfolio', promoterId],
    queryFn: () => clientRepository.listPortfolio(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientRepository.getById(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useTodayVisit(promoterId: string | undefined, clientId: string | undefined) {
  return useQuery({
    queryKey: ['today-visit', promoterId, clientId],
    queryFn: () => clientRepository.getTodayVisit(promoterId as string, clientId as string),
    enabled: Boolean(promoterId && clientId),
  });
}

/**
 * Ao concluir o check-in, invalida também as queries da Home — o roteiro e a
 * próxima visita mudam de status junto (mesma visita, mesmo `visitId`).
 *
 * Se a rede falhar, `runOrQueue` enfileira a ação para reenvio automático
 * (ver `services/sync`, Fase 4) e a mutação resolve mesmo assim — o cache de
 * `today-visit` é corrigido otimisticamente para refletir o check-in feito
 * de verdade no aparelho, mesmo sem confirmação do servidor ainda.
 */
export function useCheckIn(promoterId: string | undefined, clientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, coords }: { visitId: string; coords: Coordinates }) => {
      const occurredAt = new Date().toISOString();
      const outcome = await runOrQueue<void>('check_in', { visitId, coords, occurredAt });
      return { outcome, occurredAt };
    },
    onSuccess: ({ outcome, occurredAt }) => {
      if (outcome.synced) {
        queryClient.invalidateQueries({ queryKey: ['today-visit', promoterId, clientId] });
        queryClient.invalidateQueries({ queryKey: ['client-portfolio', promoterId] });
        queryClient.invalidateQueries({ queryKey: ['today-route', promoterId] });
        queryClient.invalidateQueries({ queryKey: ['next-visit', promoterId] });
        return;
      }

      queryClient.setQueryData<TodayVisit | null>(
        ['today-visit', promoterId, clientId],
        (old) => old && { ...old, status: 'in_progress', checkedInAt: occurredAt },
      );
    },
  });
}

/** Mesmo raciocínio de `useCheckIn` — ver comentário acima. */
export function useCheckOut(promoterId: string | undefined, clientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, coords }: { visitId: string; coords: Coordinates }) => {
      const occurredAt = new Date().toISOString();
      const outcome = await runOrQueue<void>('check_out', { visitId, coords, occurredAt });
      return { outcome, occurredAt };
    },
    onSuccess: ({ outcome, occurredAt }) => {
      if (outcome.synced) {
        queryClient.invalidateQueries({ queryKey: ['today-visit', promoterId, clientId] });
        queryClient.invalidateQueries({ queryKey: ['client-portfolio', promoterId] });
        queryClient.invalidateQueries({ queryKey: ['active-visit', promoterId] });
        queryClient.invalidateQueries({ queryKey: ['history', promoterId] });
        return;
      }

      queryClient.setQueryData<TodayVisit | null>(
        ['today-visit', promoterId, clientId],
        (old) => old && { ...old, status: 'completed', checkedOutAt: occurredAt },
      );
      queryClient.setQueryData(['active-visit', promoterId], null);
    },
  });
}
