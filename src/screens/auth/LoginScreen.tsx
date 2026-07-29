import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { lastKnownUser } from '@/services/api/lastKnownUser';
import { useBiometricAuth } from '@/shared/hooks/useBiometricAuth';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';
import { loginSchema, type LoginFormValues } from '@/validators/loginSchema';

type ScreenMode = 'checking' | 'biometric' | 'password';

/**
 * Tela de Login (wireframe "1 - Login").
 *
 * Duas variações de UI, decididas em runtime — nunca ambas ao mesmo tempo:
 *  - `biometric`: existe um nome de promotor em cache local (login anterior
 *    neste aparelho) E o hardware biométrico está disponível. Mostra
 *    "Bem-vindo de volta, {nome}" + atalho de biometria, com opção de cair
 *    para senha.
 *  - `password`: primeiro acesso neste aparelho, ou biometria indisponível/
 *    recusada. Mostra o formulário completo de e-mail/senha.
 *
 * Importante: a biometria nunca autentica sozinha contra o servidor — ela só
 * libera uma sessão do Supabase já persistida localmente (ver
 * `useBiometricAuth.ts`). Se essa sessão tiver expirado, o app cai
 * automaticamente para o formulário de senha.
 */
export function LoginScreen() {
  const [mode, setMode] = useState<ScreenMode>('checking');
  const [cachedName, setCachedName] = useState<string | null>(null);

  const { isAvailable: biometricAvailable, authenticate } = useBiometricAuth();
  const signIn = useAuthStore((s) => s.signIn);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const authStatus = useAuthStore((s) => s.status);
  const authError = useAuthStore((s) => s.errorMessage);

  const [biometricError, setBiometricError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    (async () => {
      const name = await lastKnownUser.getLastKnownName();
      setCachedName(name);
      setMode(name ? 'biometric' : 'password');
    })();
  }, []);

  async function handleBiometricPress() {
    setBiometricError(null);
    const ok = await authenticate();
    if (!ok) return;

    await restoreSession();
    // Se a sessão local não for mais válida (token expirado, logout remoto),
    // o status volta a 'unauthenticated' — nesse caso caímos para a senha
    // em vez de deixar o promotor preso numa tela que nunca avança.
    const stillUnauthenticated = useAuthStore.getState().status === 'unauthenticated';
    if (stillUnauthenticated) {
      setBiometricError('Sua sessão expirou. Entre novamente com sua senha.');
      setMode('password');
    }
  }

  async function handlePasswordSubmit(values: LoginFormValues) {
    try {
      await signIn(values.email, values.password);
      const promoter = useAuthStore.getState().promoter;
      if (promoter) {
        await lastKnownUser.setLastKnownName(promoter.fullName.split(' ')[0] ?? promoter.fullName);
      }
    } catch {
      // Erro já fica disponível em authError (store) e é exibido abaixo —
      // nada adicional a fazer aqui.
    }
  }

  const isSubmitting = authStatus === 'loading';

  return (
    <ScreenContainer className="justify-center" padded>
      <View className="items-center mb-10">
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 220, height: 85 }}
          contentFit="contain"
          accessibilityLabel="Lynkz Promotor"
        />
      </View>

      {mode === 'biometric' && (
        <View className="gap-4">
          <View className="items-center gap-1 mb-2">
            <Text className="text-ink font-extrabold text-xl">
              Bem-vindo de volta, {cachedName}
            </Text>
            <Text className="text-ink-muted text-sm">Toque para entrar com biometria.</Text>
          </View>

          <Button
            label="Entrar com biometria"
            icon={<Feather name="shield" size={18} color="#FFFFFF" />}
            onPress={handleBiometricPress}
            disabled={!biometricAvailable}
          />

          {biometricError ? (
            <Text className="text-danger text-sm text-center">{biometricError}</Text>
          ) : null}

          <View className="flex-row items-center gap-3 my-1">
            <View className="flex-1 h-px bg-line" />
            <Text className="text-ink-muted text-xs">ou</Text>
            <View className="flex-1 h-px bg-line" />
          </View>

          <Button label="Entrar com senha" variant="ghost" onPress={() => setMode('password')} />
        </View>
      )}

      {mode === 'password' && (
        <View className="gap-4">
          <View>
            <Text className="text-ink-muted text-xs mb-1.5 ml-1">E-mail</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="h-14 px-4 rounded-input border border-line bg-surface-card text-[15px] text-ink"
                  placeholder="seuemail@lynkz.com.br"
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="username"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email ? (
              <Text className="text-danger text-xs mt-1 ml-1">{errors.email.message}</Text>
            ) : null}
          </View>

          <View>
            <Text className="text-ink-muted text-xs mb-1.5 ml-1">Senha</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="h-14 px-4 rounded-input border border-line bg-surface-card text-[15px] text-ink"
                  placeholder="••••••••"
                  placeholderTextColor={colors.inkMuted}
                  secureTextEntry
                  textContentType="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password ? (
              <Text className="text-danger text-xs mt-1 ml-1">{errors.password.message}</Text>
            ) : null}
          </View>

          {authError ? <Text className="text-danger text-sm text-center">{authError}</Text> : null}

          <Button
            label="Entrar"
            onPress={handleSubmit(handlePasswordSubmit)}
            loading={isSubmitting}
          />

          {cachedName ? (
            <Pressable onPress={() => setMode('biometric')} className="items-center py-2">
              <Text className="text-ink-muted text-sm">Voltar para biometria</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <Text className="text-ink-muted text-xs text-center mt-10">Online · v0.1.0</Text>
    </ScreenContainer>
  );
}
