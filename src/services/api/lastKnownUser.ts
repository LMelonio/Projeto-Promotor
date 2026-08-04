import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'lynkz_last_promoter_name';

/**
 * Cache local (por aparelho) do nome do último promotor logado.
 *
 * Propósito ÚNICO: permitir a saudação "Bem-vindo de volta, {nome}" na tela
 * de login antes mesmo de desbloquear a sessão via biometria — é só um
 * detalhe de UX, nunca uma credencial. Por isso não precisa do
 * `LargeSecureStore` (não guarda token, cabe tranquilamente no limite do
 * SecureStore).
 */
export const lastKnownUser = {
  // Best-effort: é só um detalhe de UX (comentário acima), nunca deve
  // impedir a tela de Login de renderizar se o SecureStore falhar por
  // qualquer motivo (ex.: sem suporte na plataforma).
  async getLastKnownName(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  async setLastKnownName(name: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, name);
    } catch {
      // ignorado de propósito — ver comentário acima.
    }
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch {
      // ignorado de propósito — ver comentário acima.
    }
  },
};
