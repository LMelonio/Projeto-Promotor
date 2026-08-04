import { fakeHistoryRepository } from '../fakes/FakeHistoryRepository';
import type { IHistoryRepository } from '../interfaces/IHistoryRepository';
import { useMockData } from '@/config/env';
import type { VisitHistoryEntry } from '@/models/VisitHistoryEntry';
import { supabase } from '@/services/supabase/client';
import { minutesBetween } from '@/shared/utils/date';

/** Camada de dados do Histórico (Fase 4) — visitas já finalizadas (check-out feito). */
class HistoryRepository implements IHistoryRepository {
  async listCompletedVisits(promoterId: string): Promise<VisitHistoryEntry[]> {
    const { data: visits, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select('id, client_id, checked_in_at, checked_out_at')
      .eq('promoter_id', promoterId)
      .eq('status', 'completed')
      .order('checked_out_at', { ascending: false });

    if (error || !visits || visits.length === 0) return [];

    const completed = visits.filter(
      (v): v is typeof v & { checked_in_at: string; checked_out_at: string } =>
        Boolean(v.checked_in_at && v.checked_out_at),
    );
    if (completed.length === 0) return [];

    const [{ data: clients }, { data: activities }] = await Promise.all([
      supabase
        .schema('lynkz')
        .from('clients')
        .select('id, trade_name')
        .in(
          'id',
          completed.map((v) => v.client_id),
        ),
      supabase
        .schema('lynkz')
        .from('activities')
        .select('visit_id, photo_count')
        .in(
          'visit_id',
          completed.map((v) => v.id),
        ),
    ]);

    const clientNameById = new Map((clients ?? []).map((c) => [c.id, c.trade_name]));
    const activitySummaryByVisit = new Map<string, { count: number; photos: number }>();
    for (const activity of activities ?? []) {
      const current = activitySummaryByVisit.get(activity.visit_id) ?? { count: 0, photos: 0 };
      activitySummaryByVisit.set(activity.visit_id, {
        count: current.count + 1,
        photos: current.photos + activity.photo_count,
      });
    }

    return completed.map((visit) => {
      const summary = activitySummaryByVisit.get(visit.id) ?? { count: 0, photos: 0 };
      return {
        visitId: visit.id,
        clientName: clientNameById.get(visit.client_id) ?? 'Cliente',
        checkedInAt: visit.checked_in_at,
        checkedOutAt: visit.checked_out_at,
        durationMinutes: minutesBetween(visit.checked_in_at, visit.checked_out_at),
        activityCount: summary.count,
        photoCount: summary.photos,
      };
    });
  }
}

/** Modo mock (ver `docs/DECISIONS.md`, item 17): ver mesmo padrão em `AuthRepository.ts`. */
export const historyRepository: IHistoryRepository = useMockData
  ? fakeHistoryRepository
  : new HistoryRepository();
