import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityType } from '@/models/Activity';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { NewRupturaInput } from '@/models/Ruptura';
import { visitRepository } from '@/repositories/implementations/VisitRepository';

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

export function useRegisterActivity(visitId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      clientId: string;
      promoterId: string;
      type: ActivityType;
      photoCount: number;
    }) => visitRepository.registerActivity({ visitId: visitId as string, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', visitId] });
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

export function useSubmitQuestionnaire(visitId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: QuestionnaireAnswers) =>
      visitRepository.submitQuestionnaire(visitId as string, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionnaire', visitId] });
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

export function useRegisterRuptura(clientId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewRupturaInput) => visitRepository.registerRuptura(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-rupturas', clientId] });
    },
  });
}
