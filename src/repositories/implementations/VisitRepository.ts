import { fakeVisitRepository } from '../fakes/FakeVisitRepository';
import type { IVisitRepository } from '../interfaces/IVisitRepository';
import { useMockData } from '@/config/env';
import type { Activity, ActivityType } from '@/models/Activity';
import type { Product } from '@/models/Product';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { NewRupturaInput, Ruptura } from '@/models/Ruptura';
import type { ActiveVisit } from '@/models/Visit';
import { supabase } from '@/services/supabase/client';

/**
 * Camada de dados da Fase 3 (Atividades/Questionário/Ruptura). Ver aviso de
 * schema assumido no topo de `src/types/supabase.types.ts`.
 */
class VisitRepository implements IVisitRepository {
  async getActiveVisit(promoterId: string): Promise<ActiveVisit | null> {
    const { data: visit, error } = await supabase
      .schema('lynkz')
      .from('visits')
      .select('id, client_id, status, checked_in_at')
      .eq('promoter_id', promoterId)
      .eq('status', 'in_progress')
      .order('checked_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !visit || !visit.checked_in_at) return null;

    const { data: client } = await supabase
      .schema('lynkz')
      .from('clients')
      .select('trade_name')
      .eq('id', visit.client_id)
      .single();

    return {
      visitId: visit.id,
      clientId: visit.client_id,
      clientName: client?.trade_name ?? 'Cliente',
      checkedInAt: visit.checked_in_at,
      status: visit.status,
    };
  }

  async listActivities(visitId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('activities')
      .select('id, type, status, photo_count, notes')
      .eq('visit_id', visitId);

    if (error || !data) return [];

    return data.map((a) => ({
      id: a.id,
      type: a.type as ActivityType,
      status: a.status,
      photoCount: a.photo_count,
      notes: a.notes,
    }));
  }

  async registerActivity(input: {
    visitId: string;
    clientId: string;
    promoterId: string;
    type: ActivityType;
    photoCount: number;
  }): Promise<Activity> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('activities')
      .insert({
        visit_id: input.visitId,
        client_id: input.clientId,
        promoter_id: input.promoterId,
        type: input.type,
        status: 'completed',
        photo_count: input.photoCount,
      })
      .select('id, type, status, photo_count, notes')
      .single();

    if (error || !data) {
      throw new Error('Não foi possível registrar a atividade agora. Tente novamente.');
    }

    return {
      id: data.id,
      type: data.type as ActivityType,
      status: data.status,
      photoCount: data.photo_count,
      notes: data.notes,
    };
  }

  async getQuestionnaire(visitId: string): Promise<QuestionnaireAnswers | null> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('questionnaires')
      .select('product_exposed, merchandising_material, price_updated, needs_restocking, notes')
      .eq('visit_id', visitId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      productExposed: data.product_exposed,
      merchandisingMaterial: data.merchandising_material,
      priceUpdated: data.price_updated,
      needsRestocking: data.needs_restocking,
      notes: data.notes ?? '',
    };
  }

  async submitQuestionnaire(visitId: string, answers: QuestionnaireAnswers): Promise<void> {
    const { data: existing } = await supabase
      .schema('lynkz')
      .from('questionnaires')
      .select('id')
      .eq('visit_id', visitId)
      .maybeSingle();

    const payload = {
      product_exposed: answers.productExposed,
      merchandising_material: answers.merchandisingMaterial,
      price_updated: answers.priceUpdated,
      needs_restocking: answers.needsRestocking,
      notes: answers.notes || null,
    };

    const { error } = existing
      ? await supabase.schema('lynkz').from('questionnaires').update(payload).eq('id', existing.id)
      : await supabase
          .schema('lynkz')
          .from('questionnaires')
          .insert({ visit_id: visitId, ...payload });

    if (error) {
      throw new Error('Não foi possível salvar o questionário agora. Tente novamente.');
    }
  }

  async listAssignedProducts(promoterId: string): Promise<Product[]> {
    const { data: assigned, error } = await supabase
      .schema('lynkz')
      .from('promoter_products')
      .select('product_id')
      .eq('promoter_id', promoterId)
      .eq('status', 'available');

    if (error || !assigned || assigned.length === 0) return [];

    const { data: products, error: productsError } = await supabase
      .schema('lynkz')
      .from('products')
      .select('id, internal_code, ean_code, supplier, name, category, is_active')
      .in(
        'id',
        assigned.map((a) => a.product_id),
      )
      .eq('is_active', true);

    if (productsError || !products) return [];

    return products.map((p) => ({
      id: p.id,
      internalCode: p.internal_code,
      eanCode: p.ean_code,
      supplier: p.supplier,
      name: p.name,
      category: p.category,
      isActive: p.is_active,
    }));
  }

  async listClientRupturas(clientId: string): Promise<Ruptura[]> {
    const { data: rupturas, error } = await supabase
      .schema('lynkz')
      .from('rupturas')
      .select('id, product_id, quantity_missing, reported_at, status')
      .eq('client_id', clientId)
      .order('reported_at', { ascending: false });

    if (error || !rupturas || rupturas.length === 0) return [];

    const { data: products } = await supabase
      .schema('lynkz')
      .from('products')
      .select('id, name')
      .in(
        'id',
        rupturas.map((r) => r.product_id),
      );

    const nameById = new Map((products ?? []).map((p) => [p.id, p.name]));

    return rupturas.map((r) => ({
      id: r.id,
      productId: r.product_id,
      productName: nameById.get(r.product_id) ?? 'Produto',
      quantityMissing: r.quantity_missing,
      reportedAt: r.reported_at,
      status: r.status,
    }));
  }

  async registerRuptura(input: NewRupturaInput): Promise<Ruptura> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('rupturas')
      .insert({
        client_id: input.clientId,
        product_id: input.productId,
        supplier: input.supplier,
        quantity_missing: input.quantityMissing,
        reported_at: input.reportedAt,
        status: 'pending',
      })
      .select('id, status, reported_at')
      .single();

    if (error || !data) {
      throw new Error('Não foi possível registrar a ruptura agora. Tente novamente.');
    }

    return {
      id: data.id,
      productId: input.productId,
      productName: input.productName,
      quantityMissing: input.quantityMissing,
      reportedAt: data.reported_at,
      status: data.status,
    };
  }
}

/** Modo mock (ver `docs/DECISIONS.md`, item 17): ver mesmo padrão em `AuthRepository.ts`. */
export const visitRepository: IVisitRepository = useMockData
  ? fakeVisitRepository
  : new VisitRepository();
