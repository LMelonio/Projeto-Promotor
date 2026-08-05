import type { VisitOutcome } from './Visit';

/**
 * Item do Histórico de visitas (Fase 4) — visitas já finalizadas (check-out
 * feito). `outcome`/`rupturaCount`/`synced` adicionados a partir da
 * Documentação Funcional real — ver `docs/DECISIONS.md`, item 25.
 */
export interface VisitHistoryEntry {
  visitId: string;
  clientId: string;
  clientName: string;
  checkedInAt: string;
  checkedOutAt: string;
  durationMinutes: number;
  activityCount: number;
  photoCount: number;
  rupturaCount: number;
  outcome: VisitOutcome | null;
  /** `false` se alguma escrita desta visita ainda estiver na fila offline (ver `services/sync`). */
  synced: boolean;
}
