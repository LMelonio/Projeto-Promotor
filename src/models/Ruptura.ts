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
}
