/** Item do Histórico de visitas (Fase 4) — visitas já finalizadas (check-out feito). */
export interface VisitHistoryEntry {
  visitId: string;
  clientName: string;
  checkedInAt: string;
  checkedOutAt: string;
  durationMinutes: number;
  activityCount: number;
  photoCount: number;
}
