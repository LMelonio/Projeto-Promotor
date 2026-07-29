/**
 * Resumo operacional/comercial exibido na Home.
 * Mapeia a view `lynkz.promoter_dashboard_summary` para um formato estável
 * de UI, já com nomes que batem com o vocabulário das telas aprovadas
 * (Faturamento, Positivação, Visitas, Pendências, Tempo médio).
 */
export interface DashboardSummary {
  monthlyRevenue: number;
  positivationRate: number; // 0–1 (ex.: 0.42 = 42%)
  visitsDoneToday: number;
  visitsTotalToday: number;
  pendingCount: number;
  averageVisitMinutes: number;
}

/** Cliente e horário da próxima visita agendada, exibidos no card de destaque da Home. */
export interface NextVisit {
  visitId: string;
  clientId: string;
  clientName: string;
  rating: number | null;
  distanceKm: number | null;
  lastVisitDaysAgo: number | null;
}

/** Item da lista "Roteiro de hoje". */
export interface RouteItem {
  visitId: string;
  clientId: string;
  clientName: string;
  scheduledTime: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
