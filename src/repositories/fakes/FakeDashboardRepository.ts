import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import { fakeStore, fakeVisits } from './fakeStore';
import type { DashboardSummary, NextVisit, RouteItem } from '@/models/DashboardSummary';

/** Dashboard fictício (modo mock) — números fixos, roteiro/próxima visita derivados do estado em memória. */
class FakeDashboardRepository implements IDashboardRepository {
  async getSummary(promoterId: string): Promise<DashboardSummary> {
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = fakeStore
      .visitsForPromoter(promoterId)
      .filter((v) => v.scheduledDate === today);

    return {
      monthlyRevenue: 128450,
      positivationCount: 48,
      visitsDoneToday: todayVisits.filter((v) => v.status === 'completed').length,
      visitsTotalToday: todayVisits.length,
      pendingCount: 2,
      averageVisitMinutes: 38,
    };
  }

  async getNextVisit(promoterId: string): Promise<NextVisit | null> {
    const next = fakeStore
      .visitsForPromoter(promoterId)
      .filter((v) => v.status === 'scheduled')
      .sort((a, b) =>
        `${a.scheduledDate}${a.scheduledTime}`.localeCompare(
          `${b.scheduledDate}${b.scheduledTime}`,
        ),
      )[0];

    if (!next) return null;
    const client = fakeStore.findClient(next.clientId);

    return {
      visitId: next.id,
      clientId: next.clientId,
      clientName: client?.tradeName ?? 'Cliente',
      rating: client?.rating ?? null,
      distanceKm: null,
      lastVisitDaysAgo: null,
    };
  }

  async getTodayRoute(promoterId: string): Promise<RouteItem[]> {
    const today = new Date().toISOString().slice(0, 10);

    return fakeVisits
      .filter((v) => v.promoterId === promoterId && v.scheduledDate === today)
      .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''))
      .map((v) => ({
        visitId: v.id,
        clientId: v.clientId,
        clientName: fakeStore.findClient(v.clientId)?.tradeName ?? 'Cliente',
        scheduledTime: v.scheduledTime,
        status: v.status,
      }));
  }
}

export const fakeDashboardRepository = new FakeDashboardRepository();
