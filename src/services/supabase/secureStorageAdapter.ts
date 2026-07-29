import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * LargeSecureStore — adaptador de storage para a sessão do Supabase Auth.
 *
 * Problema que resolve: o `expo-secure-store` (Keychain/Keystore) tem limite
 * de ~2048 bytes por valor. A sessão do Supabase (access_token + refresh_token
 * + metadata do usuário) frequentemente ultrapassa esse limite, causando
 * falha silenciosa de persistência de sessão.
 *
 * Estratégia (recomendada pela própria Supabase para React Native):
 *  1. Gera-se uma chave AES-256 aleatória por registro.
 *  2. A CHAVE (pequena, ~32 bytes) fica no SecureStore — protegida por
 *     Keychain/Keystore do sistema operacional.
 *  3. O VALOR (grande, a sessão em si) é criptografado com essa chave e
 *     armazenado no AsyncStorage, que não tem limite de tamanho prático.
 *
 * Resultado: a sessão nunca fica em texto plano em disco, e não há limite de
 * tamanho. Nenhuma credencial sensível trafega ou é logada em texto puro.
 */
class LargeSecureStore {
  private async getEncryptionKey(storageKey: string): Promise<Uint8Array> {
    const keyName = `${storageKey}_key`;
    const existingKeyHex = await SecureStore.getItemAsync(keyName);
    const keyHex: string = existingKeyHex ?? (await this.generateAndPersistKey(keyName));

    return new Uint8Array(aesjs.utils.hex.toBytes(keyHex));
  }

  /** Gera uma nova chave AES-256 aleatória e a persiste no SecureStore. */
  private async generateAndPersistKey(keyName: string): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const keyHex: string = aesjs.utils.hex.fromBytes(Array.from(randomBytes));
    await SecureStore.setItemAsync(keyName, keyHex);
    return keyHex;
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;

    const encryptionKey = await this.getEncryptionKey(key);
    const encryptedBytes = new Uint8Array(aesjs.utils.hex.toBytes(encrypted));
    const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await this.getEncryptionKey(key);
    const aesCtr = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = aesCtr.encrypt(aesjs.utils.utf8.toBytes(value));
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    await AsyncStorage.setItem(key, encryptedHex);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${key}_key`);
  }
}

export const largeSecureStore = new LargeSecureStore();
