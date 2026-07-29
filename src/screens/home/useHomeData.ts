import { useQuery } from '@tanstack/react-query';

import { dashboardRepository } from '@/repositories/implementations/DashboardRepository';

/**
 * Hooks de dados da Home, isolando as telas de React Query diretamente.
 * Cada hook tem sua própria `queryKey` e pode ser invalidado independente
 * (ex.: depois de um check-out, só invalidamos "next-visit" e "route", sem
 * precisar re-buscar o resumo financeiro do mês inteiro).
 */
export function useDashboardSummary(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-summary', promoterId],
    queryFn: () => dashboardRepository.getSummary(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useNextVisit(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['next-visit', promoterId],
    queryFn: () => dashboardRepository.getNextVisit(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useTodayRoute(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['today-route', promoterId],
    queryFn: () => dashboardRepository.getTodayRoute(promoterId as string),
    enabled: Boolean(promoterId),
  });
}
