/**
 * Model de domínio de Ruptura — falta de produto identificada no cliente.
 * Severidade e foto obrigatória adicionadas a partir da Documentação
 * Funcional real (wireframe "9-Registro de ruptura" mostra "Ruptura total"
 * vs. "Estoque baixo" e "1 foto" por item — ver `docs/DECISIONS.md`, item 21).
 */
export type RupturaStatus = 'pending' | 'resolved';

export type RupturaSeverity = 'stockout' | 'low_stock';

export const RUPTURA_SEVERITY_LABEL: Record<RupturaSeverity, string> = {
  stockout: 'Ruptura total',
  low_stock: 'Estoque baixo',
};

export interface Ruptura {
  id: string;
  productId: string;
  productName: string;
  severity: RupturaSeverity;
  quantityMissing: number;
  photoCount: number;
  reportedAt: string;
  status: RupturaStatus;
}

export interface NewRupturaInput {
  clientId: string;
  productId: string;
  productName: string;
  supplier: string;
  severity: RupturaSeverity;
  quantityMissing: number;
  photoCount: number;
  /**
   * Capturado no momento em que o promotor registra a ruptura (não no
   * repositório) — se a ação for enfileirada offline (Fase 4), o horário
   * sincronizado depois precisa refletir quando ela realmente aconteceu.
   */
  reportedAt: string;
}
