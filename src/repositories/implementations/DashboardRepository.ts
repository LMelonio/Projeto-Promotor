import { fakeDashboardRepository } from '../fakes/FakeDashboardRepository';
import type { IDashboardRepository } from '../interfaces/IDashboardRepository';
import { useMockData } from '@/config/env';
import type { DashboardSummary, NextVisit, RouteItem } from '@/models/DashboardSummary';
import { supabase } from '@/services/supabase/client';

/**
 * TODO (alinhamento de backend): este repositório já assume a existência das
 * views/tabelas descritas em `src/types/supabase.types.ts`. O projeto já tem,
 * segundo as migrations em `lynkz_supabase/migrations/005_views.sql`, oito
 * views security_invoker (incluindo uma "dashboard view"). Ao conectar o
 * projeto Supabase real, revisar se essa view já entrega
 * next-visit + resumo + roteiro em uma única consulta — o ideal é substituir
 * as 3 chamadas abaixo por 1 só, reduzindo round-trips no celular em campo
 * (rede instável é o cenário normal de uso do promotor).
 */
class DashboardRepository implements IDashboardRepository {
  async getSummary(promoterId: string): Promise<DashboardSummary> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('promoter_dashboard_summary')
      .select(
        'monthly_revenue, positivation_count, visits_today_done, visits_today_total, pending_count, average_visit_minutes',
      )
      .eq('promoter_id', promoterId)
      .single();

    if (error || !data) {
      throw new Error('Não foi possível carregar os indicadores agora.');
    }

    return {
      monthlyRevenue: data.monthly_revenue,
      positivationCount: data.positivation_count,
      visitsDoneToday: data.visits_today_done,
      visitsTotalToday: data.visits_today_total,
      pendingCount: data.pending_count,
      averageVisitMinutes: data.average_visit_minutes,
    };
  }

  async getNextVisit(promoterId: string): Promise<NextVisit | null> {
    const { data: visit, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select('id, client_id, scheduled_date, scheduled_time')
      .eq('promoter_id', promoterId)
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !visit) return null;

    const { data: client } = await supabase
      .schema('lynkz')
      .from('clients')
      .select('trade_name, rating')
      .eq('id', visit.client_id)
      .single();

    return {
      visitId: visit.id,
      clientId: visit.client_id,
      clientName: client?.trade_name ?? 'Cliente',
      rating: client?.rating ?? null,
      distanceKm: null, // TODO: calcular via PostGIS (ST_Distance) contra a localização atual do dispositivo.
      lastVisitDaysAgo: null, // TODO: derivar de HistoricoVisitas quando a view estiver conectada.
    };
  }

  async getTodayRoute(promoterId: string): Promise<RouteItem[]> {
    const today = new Date().toISOString().slice(0, 10);

    const { data: visits, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select('id, client_id, scheduled_time, status')
      .eq('promoter_id', promoterId)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true });

    if (error || !visits) return [];

    const clientIds = visits.map((v) => v.client_id);
    const { data: clients } = await supabase
      .schema('lynkz')
      .from('clients')
      .select('id, trade_name')
      .in('id', clientIds);

    const nameById = new Map((clients ?? []).map((c) => [c.id, c.trade_name]));

    return visits.map((v) => ({
      visitId: v.id,
      clientId: v.client_id,
      clientName: nameById.get(v.client_id) ?? 'Cliente',
      scheduledTime: v.scheduled_time,
      status: v.status,
    }));
  }
}

/** Modo mock (ver `docs/DECISIONS.md`, item 17): ver mesmo padrão em `AuthRepository.ts`. */
export const dashboardRepository: IDashboardRepository = useMockData
  ? fakeDashboardRepository
  : new DashboardRepository();
