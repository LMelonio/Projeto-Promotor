/**
 * Model de domínio de Atividade — checklist de tarefas executadas durante a
 * visita (wireframe "Atividades", Documentação Funcional).
 *
 * Reescrito a partir da Documentação Funcional real (PDF), que mostra a tela
 * "Atividades" como uma lista de 4 itens — cada um abrindo seu próprio
 * sub-fluxo (Questionário, Fotos, Ruptura) — e NÃO o catálogo genérico de 6
 * tipos assumido na Fase 3 a partir de uma planilha de dados de exemplo (ver
 * `docs/DECISIONS.md`, item 21). O 4º item ("Verificação de preços") não
 * aparece no print da documentação (cortado/fora de tela) — é um placeholder
 * assumido para fechar a conta "1 de 4 concluídas" / "conclua 2 atividades
 * obrigatórias" do wireframe; reconciliar se a especificação real divergir.
 */
export type ActivityKind = 'questionnaire' | 'photos' | 'price_check' | 'ruptura';

export interface ActivityDefinition {
  kind: ActivityKind;
  label: string;
  mandatory: boolean;
  /** Só relevante para `kind: 'photos'` — quantidade de fotos exigida. */
  requiredPhotoCount?: number;
}

export const ACTIVITY_CHECKLIST: ActivityDefinition[] = [
  { kind: 'questionnaire', label: 'Questionário de PDV', mandatory: true },
  { kind: 'photos', label: 'Fotos da gôndola', mandatory: true, requiredPhotoCount: 3 },
  { kind: 'price_check', label: 'Verificação de preços', mandatory: true },
  { kind: 'ruptura', label: 'Registro de ruptura', mandatory: false },
];

export type ActivityStatus = 'pending' | 'completed';

/** Atividade registrada (ou pendente) para a visita em andamento. */
export interface Activity {
  id: string;
  kind: ActivityKind;
  status: ActivityStatus;
  photoCount: number;
}
