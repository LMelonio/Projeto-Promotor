import type { VisitStatus } from './Client';

/** Visita atualmente em andamento (checked-in) do promotor autenticado, se houver. */
export interface ActiveVisit {
  visitId: string;
  clientId: string;
  clientName: string;
  checkedInAt: string;
  status: VisitStatus;
}
