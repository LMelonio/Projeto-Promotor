import type { IHistoryRepository } from '../interfaces/IHistoryRepository';
import { fakeStore, fakeActivities, fakeRupturas, fakeVisits } from './fakeStore';
import type { VisitHistoryEntry } from '@/models/VisitHistoryEntry';
import { minutesBetween } from '@/shared/utils/date';

/** Histórico fictício (modo mock) — visitas concluídas em `fakeVisits`. */
class FakeHistoryRepository implements IHistoryRepository {
  async listCompletedVisits(promoterId: string): Promise<VisitHistoryEntry[]> {
    return fakeVisits
      .filter(
        (v) =>
          v.promoterId === promoterId &&
          v.status === 'completed' &&
          v.checkedInAt &&
          v.checkedOutAt,
      )
      .sort((a, b) => (b.checkedOutAt ?? '').localeCompare(a.checkedOutAt ?? ''))
      .map((visit) => {
        const checkedInAt = visit.checkedInAt as string;
        const checkedOutAt = visit.checkedOutAt as string;
        const activities = fakeActivities.filter((a) => a.visitId === visit.id);
        const rupturaCount = fakeRupturas.filter(
          (r) =>
            r.clientId === visit.clientId &&
            r.reportedAt >= checkedInAt &&
            r.reportedAt <= checkedOutAt,
        ).length;

        return {
          visitId: visit.id,
          clientId: visit.clientId,
          clientName: fakeStore.findClient(visit.clientId)?.tradeName ?? 'Cliente',
          checkedInAt,
          checkedOutAt,
          durationMinutes: minutesBetween(checkedInAt, checkedOutAt),
          activityCount: activities.length,
          photoCount: activities.reduce((sum, a) => sum + a.photoCount, 0),
          rupturaCount,
          outcome: visit.outcome,
          synced: true,
        };
      });
  }
}

export const fakeHistoryRepository = new FakeHistoryRepository();
