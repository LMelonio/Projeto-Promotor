import type { IVisitRepository } from '../interfaces/IVisitRepository';
import { fakeProducts, fakeStore } from './fakeStore';
import type { Activity, ActivityKind } from '@/models/Activity';
import type { Product } from '@/models/Product';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { NewRupturaInput, Ruptura } from '@/models/Ruptura';
import type { ActiveVisit } from '@/models/Visit';

/** Visita em andamento fictícia (modo mock) — Atividades/Questionário/Ruptura sobre `fakeStore`. */
class FakeVisitRepository implements IVisitRepository {
  async getActiveVisit(promoterId: string): Promise<ActiveVisit | null> {
    const visit = fakeStore.findActiveVisit(promoterId);
    if (!visit || !visit.checkedInAt) return null;

    const client = fakeStore.findClient(visit.clientId);
    return {
      visitId: visit.id,
      clientId: visit.clientId,
      clientName: client?.tradeName ?? 'Cliente',
      checkedInAt: visit.checkedInAt,
      status: visit.status,
    };
  }

  async listActivities(visitId: string): Promise<Activity[]> {
    return fakeStore.activitiesForVisit(visitId);
  }

  async registerActivity(input: {
    visitId: string;
    clientId: string;
    promoterId: string;
    kind: ActivityKind;
    photoCount: number;
  }): Promise<Activity> {
    return fakeStore.addActivity(input);
  }

  async getQuestionnaire(visitId: string): Promise<QuestionnaireAnswers | null> {
    return fakeStore.getQuestionnaire(visitId);
  }

  async submitQuestionnaire(visitId: string, answers: QuestionnaireAnswers): Promise<void> {
    fakeStore.setQuestionnaire(visitId, answers);
  }

  async listAssignedProducts(_promoterId: string): Promise<Product[]> {
    return fakeProducts;
  }

  async listClientRupturas(clientId: string): Promise<Ruptura[]> {
    return fakeStore.rupturasForClient(clientId);
  }

  async registerRuptura(input: NewRupturaInput): Promise<Ruptura> {
    return fakeStore.addRuptura(input);
  }
}

export const fakeVisitRepository = new FakeVisitRepository();
