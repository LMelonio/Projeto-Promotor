/** Model de domínio de Ruptura — falta de produto identificada no cliente. */
export type RupturaStatus = 'pending' | 'resolved';

export interface Ruptura {
  id: string;
  productId: string;
  productName: string;
  quantityMissing: number;
  reportedAt: string;
  status: RupturaStatus;
}

export interface NewRupturaInput {
  clientId: string;
  productId: string;
  productName: string;
  supplier: string;
  quantityMissing: number;
  /**
   * Capturado no momento em que o promotor registra a ruptura (não no
   * repositório) — se a ação for enfileirada offline (Fase 4), o horário
   * sincronizado depois precisa refletir quando ela realmente aconteceu.
   */
  reportedAt: string;
}
