/**
 * Model de domínio de Produto (catálogo dos fornecedores Avert, Boehringer,
 * Organnact). Usado pela Ruptura (Fase 3) para localizar o item em falta no
 * cliente. Independente do schema do banco — ver `docs/ARCHITECTURE.md`.
 */
export interface Product {
  id: string;
  internalCode: string;
  eanCode: string;
  supplier: string;
  name: string;
  category: string;
  isActive: boolean;
}
