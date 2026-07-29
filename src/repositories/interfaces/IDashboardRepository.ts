import type { DashboardSummary, NextVisit, RouteItem } from '@/models/DashboardSummary';

export interface IDashboardRepository {
  getSummary(promoterId: string): Promise<DashboardSummary>;
  getNextVisit(promoterId: string): Promise<NextVisit | null>;
  getTodayRoute(promoterId: string): Promise<RouteItem[]>;
}
