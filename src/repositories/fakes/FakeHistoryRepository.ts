import type { IHistoryRepository } from '../interfaces/IHistoryRepository';
import { fakeStore, fakeActivities, fakeVisits } from './fakeStore';
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
        const activities = fakeActivities.filter((a) => a.visitId === visit.id);
        return {
          visitId: visit.id,
          clientName: fakeStore.findClient(visit.clientId)?.tradeName ?? 'Cliente',
          checkedInAt: visit.checkedInAt as string,
          checkedOutAt: visit.checkedOutAt as string,
          durationMinutes: minutesBetween(
            visit.checkedInAt as string,
            visit.checkedOutAt as string,
          ),
          activityCount: activities.length,
          photoCount: activities.reduce((sum, a) => sum + a.photoCount, 0),
        };
      });
  }
}

export const fakeHistoryRepository = new FakeHistoryRepository();
