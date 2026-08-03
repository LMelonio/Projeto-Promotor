import type { Activity, ActivityType } from '@/models/Activity';
import type { Product } from '@/models/Product';
import type { QuestionnaireAnswers } from '@/models/Questionnaire';
import type { NewRupturaInput, Ruptura } from '@/models/Ruptura';
import type { ActiveVisit } from '@/models/Visit';

export interface IVisitRepository {
  getActiveVisit(promoterId: string): Promise<ActiveVisit | null>;
  listActivities(visitId: string): Promise<Activity[]>;
  registerActivity(input: {
    visitId: string;
    clientId: string;
    promoterId: string;
    type: ActivityType;
    photoCount: number;
  }): Promise<Activity>;
  getQuestionnaire(visitId: string): Promise<QuestionnaireAnswers | null>;
  submitQuestionnaire(visitId: string, answers: QuestionnaireAnswers): Promise<void>;
  listAssignedProducts(promoterId: string): Promise<Product[]>;
  listClientRupturas(clientId: string): Promise<Ruptura[]>;
  registerRuptura(input: NewRupturaInput): Promise<Ruptura>;
}
