import type { Client, ClientListItem, TodayVisit } from '@/models/Client';

export interface IClientRepository {
  listPortfolio(promoterId: string): Promise<ClientListItem[]>;
  getById(clientId: string): Promise<Client>;
  getTodayVisit(promoterId: string, clientId: string): Promise<TodayVisit | null>;
  checkIn(
    visitId: string,
    coords: { latitude: number; longitude: number },
    occurredAt: string,
  ): Promise<void>;
  checkOut(
    visitId: string,
    coords: { latitude: number; longitude: number },
    occurredAt: string,
  ): Promise<void>;
}
