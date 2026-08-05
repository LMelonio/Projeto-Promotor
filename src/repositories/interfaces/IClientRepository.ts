import type { Client, ClientListItem, TodayVisit } from '@/models/Client';
import type { VisitOutcome, VisitReason } from '@/models/Visit';

export interface IClientRepository {
  listPortfolio(promoterId: string): Promise<ClientListItem[]>;
  getById(clientId: string): Promise<Client>;
  getTodayVisit(promoterId: string, clientId: string): Promise<TodayVisit | null>;
  checkIn(
    visitId: string,
    coords: { latitude: number; longitude: number },
    occurredAt: string,
  ): Promise<void>;
  checkOut(input: {
    visitId: string;
    coords: { latitude: number; longitude: number };
    occurredAt: string;
    reason: VisitReason;
    outcome: VisitOutcome;
  }): Promise<void>;
}
