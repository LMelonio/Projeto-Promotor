/**
 * Models de domínio de Cliente e Visita usados pelas telas de Clientes
 * (Fase 2). Independentes do schema do banco — ver `docs/ARCHITECTURE.md`.
 */
export type FinancialStatus = 'compliant' | 'delinquent';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

/** Rótulo/tom de badge por situação financeira — usado no card da lista e no Detalhe do Cliente. */
export const FINANCIAL_STATUS_LABEL: Record<FinancialStatus, string> = {
  compliant: 'Adimplente',
  delinquent: 'Inadimplente',
};
export const FINANCIAL_STATUS_TONE: Record<FinancialStatus, 'success' | 'danger'> = {
  compliant: 'success',
  delinquent: 'danger',
};

/**
 * Campos adicionados a partir do wireframe "4-Detalhes do Cliente"
 * (Documentação Funcional real) — ver `docs/DECISIONS.md`, item 23.
 */
export interface Client {
  id: string;
  erpCode: string;
  cnpj: string;
  legalName: string;
  tradeName: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  creditLimit: number;
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
  checkedOutAt: string | null;
}

/** Item da carteira de clientes (lista da tela Clientes/Roteiro). */
export interface ClientListItem extends Client {
  lastVisitDaysAgo: number | null;
  todayVisit: TodayVisit | null;
}
