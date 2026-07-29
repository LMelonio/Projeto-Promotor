import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';

/**
 * Autenticação biométrica — modelo mental importante:
 *
 * A biometria (Face ID / digital) NÃO substitui a autenticação no Supabase.
 * Ela é um "cadeado local" sobre uma sessão que já existe no aparelho: o
 * promotor faz login com e-mail/senha uma vez, o Supabase mantém a sessão
 * persistida (ver `secureStorageAdapter.ts`), e a biometria apenas libera o
 * acesso a essa sessão já existente sem exigir digitar a senha de novo.
 * Se não houver sessão ativa (token expirado, logout, app reinstalado), a
 * tela de login sempre volta a pedir e-mail/senha — a biometria some.
 */
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirme sua identidade para entrar',
      cancelLabel: 'Usar senha',
      disableDeviceFallback: false,
    });
    return result.success;
  }, []);

  return { isAvailable, authenticate };
}
