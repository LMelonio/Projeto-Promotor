import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientRepository } from '@/repositories/implementations/ClientRepository';
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
 */
export function useCheckIn(promoterId: string | undefined, clientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, coords }: { visitId: string; coords: Coordinates }) =>
      clientRepository.checkIn(visitId, coords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-visit', promoterId, clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-portfolio', promoterId] });
      queryClient.invalidateQueries({ queryKey: ['today-route', promoterId] });
      queryClient.invalidateQueries({ queryKey: ['next-visit', promoterId] });
    },
  });
}
