import type { IClientRepository } from '../interfaces/IClientRepository';
import { fakeClients, fakeStore, fakeVisits } from './fakeStore';
import type { Client, ClientListItem, TodayVisit } from '@/models/Client';
import type { Coordinates } from '@/shared/utils/geo';

/** Carteira de Clientes fictícia (modo mock) — deriva roteiro/status a partir de `fakeVisits`. */
class FakeClientRepository implements IClientRepository {
  async listPortfolio(promoterId: string): Promise<ClientListItem[]> {
    const today = new Date().toISOString().slice(0, 10);
    const visits = fakeStore.visitsForPromoter(promoterId);

    return fakeClients.map((client) => {
      const lastCompleted = visits
        .filter((v) => v.clientId === client.id && v.status === 'completed')
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))[0];

      const todayVisit = visits.find((v) => v.clientId === client.id && v.scheduledDate === today);

      return {
        ...client,
        lastVisitDaysAgo: lastCompleted
          ? Math.floor(
              (Date.now() - new Date(`${lastCompleted.scheduledDate}T00:00:00`).getTime()) /
                86_400_000,
            )
          : null,
        todayVisit: todayVisit
          ? {
              visitId: todayVisit.id,
              scheduledTime: todayVisit.scheduledTime,
              status: todayVisit.status,
              checkedInAt: todayVisit.checkedInAt,
              checkedOutAt: todayVisit.checkedOutAt,
            }
          : null,
      };
    });
  }

  async getById(clientId: string): Promise<Client> {
    const client = fakeStore.findClient(clientId);
    if (!client) {
      throw new Error('Não foi possível carregar este cliente agora.');
    }
    return client;
  }

  async getTodayVisit(promoterId: string, clientId: string): Promise<TodayVisit | null> {
    const today = new Date().toISOString().slice(0, 10);
    const visit = fakeVisits.find(
      (v) => v.promoterId === promoterId && v.clientId === clientId && v.scheduledDate === today,
    );
    if (!visit) return null;

    return {
      visitId: visit.id,
      scheduledTime: visit.scheduledTime,
      status: visit.status,
      checkedInAt: visit.checkedInAt,
      checkedOutAt: visit.checkedOutAt,
    };
  }

  async checkIn(visitId: string, coords: Coordinates, occurredAt: string): Promise<void> {
    fakeStore.checkIn(visitId, coords, occurredAt);
  }

  async checkOut(visitId: string, coords: Coordinates, occurredAt: string): Promise<void> {
    fakeStore.checkOut(visitId, coords, occurredAt);
  }
}

export const fakeClientRepository = new FakeClientRepository();
