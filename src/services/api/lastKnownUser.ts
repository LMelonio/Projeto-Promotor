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
  async getLastKnownName(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEY);
  },

  async setLastKnownName(name: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEY, name);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  },
};
