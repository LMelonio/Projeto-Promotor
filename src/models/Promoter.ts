/**
 * Model de domínio do Promotor Técnico.
 *
 * Por que um model separado da linha do banco (`Database['lynkz']['Tables']...`):
 * a UI nunca deve depender diretamente do formato de armazenamento. Se um
 * dia o schema mudar (ex.: renomear coluna, dividir tabela), só o
 * Repository/mapper muda — nenhuma tela quebra.
 */
/** `role`/`city` adicionados a partir do wireframe de Perfil — ver `docs/DECISIONS.md`, item 26. */
export interface Promoter {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  supplier: string;
  role: string;
  city: string;
  isActive: boolean;
}
