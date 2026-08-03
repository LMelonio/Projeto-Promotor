/**
 * Model de domínio de Atividade — checklist de tarefas executadas durante a
 * visita (wireframe "Atividades", Fase 3). Catálogo fixo de seis tipos,
 * decisão de produto já validada (ver planilha funcional de referência
 * citada em `docs/DECISIONS.md`, item 12) — não é dado dinâmico do backend.
 */
export type ActivityType =
  | 'material_installation'
  | 'training'
  | 'shelf_organization'
  | 'pricing'
  | 'promotion'
  | 'restocking';

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  material_installation: 'Instalação de materiais',
  training: 'Treinamento',
  shelf_organization: 'Organização de gôndola',
  pricing: 'Precificação',
  promotion: 'Ação promocional',
  restocking: 'Reposição',
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_TYPE_LABEL) as ActivityType[];

export type ActivityStatus = 'pending' | 'completed';

/** Atividade registrada (ou pendente) para a visita em andamento. */
export interface Activity {
  id: string;
  type: ActivityType;
  status: ActivityStatus;
  photoCount: number;
  notes: string | null;
}
