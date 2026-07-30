/**
 * Models de domínio de Cliente e Visita usados pelas telas de Clientes
 * (Fase 2). Independentes do schema do banco — ver `docs/ARCHITECTURE.md`.
 */
export type FinancialStatus = 'compliant' | 'delinquent';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Client {
  id: string;
  erpCode: string;
  legalName: string;
  tradeName: string;
  rating: number | null;
  latitude: number;
  longitude: number;
  financialStatus: FinancialStatus;
}

/** Visita de hoje entre o promotor autenticado e este cliente, se houver. */
export interface TodayVisit {
  visitId: string;
  scheduledTime: string | null;
  status: VisitStatus;
  checkedInAt: string | null;
}

/** Item da carteira de clientes (lista da tela Clientes/Roteiro). */
export interface ClientListItem extends Client {
  lastVisitDaysAgo: number | null;
  todayVisit: TodayVisit | null;
}
