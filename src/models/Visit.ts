import type { VisitStatus } from './Client';

/** Visita atualmente em andamento (checked-in) do promotor autenticado, se houver. */
export interface ActiveVisit {
  visitId: string;
  clientId: string;
  clientName: string;
  checkedInAt: string;
  status: VisitStatus;
}

/**
 * Motivo e resultado da visita — capturados no Check-out (wireframe
 * "10-Check-out", Documentação Funcional). Só "Venda" (motivo) e "Visita
 * concluída"/"Cliente ausente" (resultado) são confirmados pelo wireframe;
 * os demais valores são extensões razoáveis (motivos vistos também na
 * planilha de referência, decisão nº 12) — ver `docs/DECISIONS.md`, item 22.
 */
export type VisitReason = 'sale' | 'training' | 'routine' | 'audit';

export const VISIT_REASON_LABEL: Record<VisitReason, string> = {
  sale: 'Venda',
  training: 'Treinamento',
  routine: 'Visita de rotina',
  audit: 'Auditoria',
};

export const VISIT_REASONS = Object.keys(VISIT_REASON_LABEL) as VisitReason[];

export type VisitOutcome = 'completed' | 'client_absent' | 'closed';

export const VISIT_OUTCOME_LABEL: Record<VisitOutcome, string> = {
  completed: 'Visita concluída',
  client_absent: 'Cliente ausente',
  closed: 'Estabelecimento fechado',
};

export const VISIT_OUTCOMES = Object.keys(VISIT_OUTCOME_LABEL) as VisitOutcome[];

/** Resumo mostrado na tela de Check-out antes de confirmar. */
export interface VisitSummary {
  durationMinutes: number;
  activitiesDone: number;
  activitiesTotal: number;
  photoCount: number;
  rupturaCount: number;
}
