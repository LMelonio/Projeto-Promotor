import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import type { Activity, ActivityType } from '@/models/Activity';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { NewRupturaInput } from '@/models/Ruptura';
import { visitRepository } from '@/repositories/implementations/VisitRepository';
import { runOrQueue } from '@/services/sync/syncEngine';

/** Hooks de dados das telas de Visita (Fase 3) — mesmo padrão de `screens/home/useHomeData.ts`. */
export function useActiveVisit(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['active-visit', promoterId],
    queryFn: () => visitRepository.getActiveVisit(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useActivities(visitId: string | undefined) {
  return useQuery({
    queryKey: ['activities', visitId],
    queryFn: () => visitRepository.listActivities(visitId as string),
    enabled: Boolean(visitId),
  });
}

/**
 * Se a rede falhar, `runOrQueue` enfileira o registro para reenvio (Fase 4,
 * ver `services/sync`) e o checklist da visita é atualizado otimisticamente
 * mesmo assim — a foto foi capturada de verdade no aparelho, o promotor não
 * deveria ver a atividade voltar a aparecer como pendente.
 */
export function useRegisterActivity(visitId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      clientId: string;
      promoterId: string;
      type: ActivityType;
      photoCount: number;
    }) => runOrQueue<Activity>('register_activity', { visitId: visitId as string, ...input }),
    onSuccess: (outcome, variables) => {
      if (outcome.synced) {
        queryClient.invalidateQueries({ queryKey: ['activities', visitId] });
        return;
      }

      queryClient.setQueryData<Activity[]>(['activities', visitId], (old) => [
        ...(old ?? []),
        {
          id: `local-${Crypto.randomUUID()}`,
          type: variables.type,
          status: 'completed',
          photoCount: variables.photoCount,
          notes: null,
        },
      ]);
    },
  });
}

export function useQuestionnaire(visitId: string | undefined) {
  return useQuery({
    queryKey: ['questionnaire', visitId],
    queryFn: () => visitRepository.getQuestionnaire(visitId as string),
    enabled: Boolean(visitId),
  });
}

/** Mesmo raciocínio de `useRegisterActivity` — ver comentário acima. */
export function useSubmitQuestionnaire(visitId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: QuestionnaireAnswers) =>
      runOrQueue<void>('submit_questionnaire', { visitId: visitId as string, answers }),
    onSuccess: (outcome, answers) => {
      if (outcome.synced) {
        queryClient.invalidateQueries({ queryKey: ['questionnaire', visitId] });
        return;
      }

      queryClient.setQueryData<QuestionnaireAnswers>(['questionnaire', visitId], answers);
    },
  });
}

export function useAssignedProducts(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['assigned-products', promoterId],
    queryFn: () => visitRepository.listAssignedProducts(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useClientRupturas(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client-rupturas', clientId],
    queryFn: () => visitRepository.listClientRupturas(clientId as string),
    enabled: Boolean(clientId),
  });
}

/**
 * Simplificação deliberada (ver `docs/DECISIONS.md`, item 14): ao contrário
 * de Atividade/Questionário, esta lista não recebe patch otimista quando a
 * ruptura é enfileirada offline — só aparece aqui após sincronizar de
 * verdade. O registro em si nunca é perdido (fica na fila até conseguir
 * enviar), só a exibição imediata na lista que fica pendente.
 */
export function useRegisterRuptura(clientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewRupturaInput) => runOrQueue('register_ruptura', input),
    onSuccess: (outcome) => {
      if (outcome.synced) {
        queryClient.invalidateQueries({ queryKey: ['client-rupturas', clientId] });
      }
    },
  });
}
