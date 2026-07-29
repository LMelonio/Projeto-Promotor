/**
 * Model de domínio do Promotor Técnico.
 *
 * Por que um model separado da linha do banco (`Database['lynkz']['Tables']...`):
 * a UI nunca deve depender diretamente do formato de armazenamento. Se um
 * dia o schema mudar (ex.: renomear coluna, dividir tabela), só o
 * Repository/mapper muda — nenhuma tela quebra.
 */
export interface Promoter {
  id: string;
  fullName: string;
  email: string;
  supplier: string;
  isActive: boolean;
}
