import type { VisitHistoryEntry } from '@/models/VisitHistoryEntry';

export interface IHistoryRepository {
  listCompletedVisits(promoterId: string): Promise<VisitHistoryEntry[]>;
}
