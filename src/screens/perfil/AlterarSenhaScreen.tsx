import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useUpdatePassword } from './usePerfilData';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import type { PerfilStackParamList } from '@/navigation/types';
import { colors } from '@/theme';

const MIN_PASSWORD_LENGTH = 6;

/** Alterar senha (wireframe de Perfil) — ver `docs/DECISIONS.md`, item 26. */
export function AlterarSenhaScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();
  const updatePassword = useUpdatePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validationError =
    newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH
      ? `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
      : confirmPassword.length > 0 && newPassword !== confirmPassword
        ? 'As senhas não coincidem.'
        : null;

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    newPassword === confirmPassword;

  async function handleSubmit() {
    if (!canSubmit) return;
    await updatePassword.mutateAsync({ currentPassword, newPassword });
    navigation.goBack();
  }

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-center gap-3 mt-4 mb-5">
        <Feather
          name="chevron-left"
          size={24}
          color={colors.ink}
          onPress={() => navigation.goBack()}
        />
        <Text className="text-ink font-extrabold text-xl flex-1" numberOfLines={1}>
          Alterar senha
        </Text>
      </View>

      <View className="gap-4">
        <View>
          <Text className="text-ink-muted text-xs mb-1.5 ml-1">Senha atual</Text>
          <TextInput
            className="h-14 px-4 rounded-input border border-line bg-surface-card text-[15px] text-ink"
            placeholder="••••••••"
            placeholderTextColor={colors.inkMuted}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View>
          <Text className="text-ink-muted text-xs mb-1.5 ml-1">Nova senha</Text>
          <TextInput
            className="h-14 px-4 rounded-input border border-line bg-surface-card text-[15px] text-ink"
            placeholder="••••••••"
            placeholderTextColor={colors.inkMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View>
          <Text className="text-ink-muted text-xs mb-1.5 ml-1">Confirmar nova senha</Text>
          <TextInput
            className="h-14 px-4 rounded-input border border-line bg-surface-card text-[15px] text-ink"
            placeholder="••••••••"
            placeholderTextColor={colors.inkMuted}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {validationError ? <Text className="text-danger text-xs">{validationError}</Text> : null}

        {updatePassword.isError ? (
          <Text className="text-danger text-xs">
            {updatePassword.error instanceof Error
              ? updatePassword.error.message
              : 'Não foi possível alterar sua senha agora.'}
          </Text>
        ) : null}

        <Button
          label="Salvar"
          disabled={!canSubmit}
          loading={updatePassword.isPending}
          onPress={handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}
