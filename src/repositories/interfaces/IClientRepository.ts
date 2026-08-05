import type { Client, ClientListItem, TodayVisit } from '@/models/Client';
import type { VisitOutcome, VisitReason } from '@/models/Visit';
import type { Coordinates } from '@/shared/utils/geo';

export interface IClientRepository {
  listPortfolio(promoterId: string): Promise<ClientListItem[]>;
  getById(clientId: string): Promise<Client>;
  getTodayVisit(promoterId: string, clientId: string): Promise<TodayVisit | null>;
  checkIn(visitId: string, coords: Coordinates, occurredAt: string): Promise<void>;
  checkOut(input: {
    visitId: string;
    coords: Coordinates;
    occurredAt: string;
    reason: VisitReason;
    outcome: VisitOutcome;
  }): Promise<void>;
}
