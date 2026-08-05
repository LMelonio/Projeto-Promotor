import { fakeClientRepository } from '../fakes/FakeClientRepository';
import type { IClientRepository } from '../interfaces/IClientRepository';
import { useMockData } from '@/config/env';
import type { Client, ClientListItem, TodayVisit, VisitStatus } from '@/models/Client';
import type { VisitOutcome, VisitReason } from '@/models/Visit';
import { supabase } from '@/services/supabase/client';
import type { Coordinates } from '@/shared/utils/geo';

/**
 * TODO (alinhamento de backend): não existe, nas migrations conhecidas até
 * agora, uma tabela explícita de "carteira" (promotor ↔ cliente). Por isso
 * `listPortfolio` deriva a carteira a partir do histórico de `visits` do
 * promotor (mesmo padrão já usado em `DashboardRepository.getTodayRoute`) —
 * ou seja, "carteira" aqui significa "todo cliente com pelo menos uma visita
 * registrada para este promotor". Se as migrations reais tiverem uma tabela
 * de atribuição fixa, revisar este método para consultá-la diretamente.
 */
class ClientRepository implements IClientRepository {
  async listPortfolio(promoterId: string): Promise<ClientListItem[]> {
    const { data: visits, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select(
        'id, client_id, scheduled_date, scheduled_time, status, checked_in_at, checked_out_at',
      )
      .eq('promoter_id', promoterId)
      .order('scheduled_date', { ascending: false });

    if (error) {
      throw new Error('Não foi possível carregar sua carteira de clientes agora.');
    }
    if (!visits || visits.length === 0) return [];

    const clientIds = Array.from(new Set(visits.map((v) => v.client_id)));
    const { data: clients, error: clientsError } = await supabase
      .schema('lynkz')
      .from('clients')
      .select(
        'id, erp_code, cnpj, legal_name, trade_name, email, phone, address, neighborhood, city, state, credit_limit, rating, latitude, longitude, financial_status',
      )
      .in('id', clientIds)
      .is('deleted_at', null);

    if (clientsError || !clients) {
      throw new Error('Não foi possível carregar os dados dos clientes agora.');
    }

    const today = new Date().toISOString().slice(0, 10);
    const lastVisitDateByClient = new Map<string, string>();
    const todayVisitByClient = new Map<string, TodayVisit>();

    // `visits` já vem ordenado por data decrescente, então o primeiro
    // "completed" encontrado por cliente é a visita concluída mais recente.
    for (const visit of visits) {
      if (visit.status === 'completed' && !lastVisitDateByClient.has(visit.client_id)) {
        lastVisitDateByClient.set(visit.client_id, visit.scheduled_date);
      }
      if (visit.scheduled_date === today) {
        todayVisitByClient.set(visit.client_id, {
          visitId: visit.id,
          scheduledTime: visit.scheduled_time,
          status: visit.status as VisitStatus,
          checkedInAt: visit.checked_in_at,
          checkedOutAt: visit.checked_out_at,
        });
      }
    }

    return clients.map((c) => ({
      id: c.id,
      erpCode: c.erp_code,
      cnpj: c.cnpj,
      legalName: c.legal_name,
      tradeName: c.trade_name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      neighborhood: c.neighborhood,
      city: c.city,
      state: c.state,
      creditLimit: c.credit_limit,
      rating: c.rating,
      latitude: c.latitude,
      longitude: c.longitude,
      financialStatus: c.financial_status,
      lastVisitDaysAgo: this.daysAgoFromDateOnly(lastVisitDateByClient.get(c.id)),
      todayVisit: todayVisitByClient.get(c.id) ?? null,
    }));
  }

  async getById(clientId: string): Promise<Client> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('clients')
      .select(
        'id, erp_code, cnpj, legal_name, trade_name, email, phone, address, neighborhood, city, state, credit_limit, rating, latitude, longitude, financial_status',
      )
      .eq('id', clientId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new Error('Não foi possível carregar este cliente agora.');
    }

    return {
      id: data.id,
      erpCode: data.erp_code,
      cnpj: data.cnpj,
      legalName: data.legal_name,
      tradeName: data.trade_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      creditLimit: data.credit_limit,
      rating: data.rating,
      latitude: data.latitude,
      longitude: data.longitude,
      financialStatus: data.financial_status,
    };
  }

  async getTodayVisit(promoterId: string, clientId: string): Promise<TodayVisit | null> {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select('id, scheduled_time, status, checked_in_at, checked_out_at')
      .eq('promoter_id', promoterId)
      .eq('client_id', clientId)
      .eq('scheduled_date', today)
      .maybeSingle();

    if (error || !data) return null;

    return {
      visitId: data.id,
      scheduledTime: data.scheduled_time,
      status: data.status as VisitStatus,
      checkedInAt: data.checked_in_at,
      checkedOutAt: data.checked_out_at,
    };
  }

  async checkIn(visitId: string, coords: Coordinates, occurredAt: string): Promise<void> {
    const { error } = await supabase
      .schema('lynkz')
      .from('visits')
      .update({
        status: 'in_progress',
        checked_in_at: occurredAt,
        checked_in_latitude: coords.latitude,
        checked_in_longitude: coords.longitude,
      })
      .eq('id', visitId);

    if (error) {
      throw new Error('Não foi possível registrar o check-in agora. Tente novamente.');
    }
  }

  async checkOut(input: {
    visitId: string;
    coords: Coordinates;
    occurredAt: string;
    reason: VisitReason;
    outcome: VisitOutcome;
  }): Promise<void> {
    const { error } = await supabase
      .schema('lynkz')
      .from('visits')
      .update({
        status: 'completed',
        checked_out_at: input.occurredAt,
        checked_out_latitude: input.coords.latitude,
        checked_out_longitude: input.coords.longitude,
        reason: input.reason,
        outcome: input.outcome,
      })
      .eq('id', input.visitId);

    if (error) {
      throw new Error('Não foi possível registrar o check-out agora. Tente novamente.');
    }
  }

  private daysAgoFromDateOnly(dateOnly: string | undefined): number | null {
    if (!dateOnly) return null;
    const diffMs = Date.now() - new Date(`${dateOnly}T00:00:00`).getTime();
    return Math.floor(diffMs / 86_400_000);
  }
}

/** Modo mock (ver `docs/DECISIONS.md`, item 17): ver mesmo padrão em `AuthRepository.ts`. */
export const clientRepository: IClientRepository = useMockData
  ? fakeClientRepository
  : new ClientRepository();
