/**
 * Model de domínio do Questionário de visita — quatro perguntas objetivas
 * (sim/não) mais observações livres, uma resposta por visita.
 */
export interface QuestionnaireAnswers {
  productExposed: boolean;
  merchandisingMaterial: boolean;
  priceUpdated: boolean;
  needsRestocking: boolean;
  notes: string;
}
