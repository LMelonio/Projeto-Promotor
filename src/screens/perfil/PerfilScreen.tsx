import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSyncStatus } from '@/services/sync/useSyncStatus';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Perfil completo (Fase 4): dados do promotor + status da fila de
 * sincronização offline (ver `services/sync`, atualizado ao focar a tela) +
 * logout — já implementado desde a Fase 1 por ser necessário para testar o
 * fluxo de login novamente durante o desenvolvimento.
 */
export function PerfilScreen() {
  const promoter = useAuthStore((s) => s.promoter);
  const signOut = useAuthStore((s) => s.signOut);
  const { pendingCount, isSyncing, syncNow, refresh } = useSyncStatus();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ScreenContainer className="justify-between pb-6">
      <View>
        <Text className="text-ink font-extrabold text-xl mt-4 mb-4">Perfil</Text>

        {promoter ? (
          <Card className="flex-row items-center gap-3 mb-4">
            <View className="w-12 h-12 rounded-full bg-brand/10 items-center justify-center">
              <Text className="text-brand font-bold text-base">{initials(promoter.fullName)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-ink font-semibold text-sm" numberOfLines={1}>
                {promoter.fullName}
              </Text>
              <Text className="text-ink-muted text-xs" numberOfLines={1}>
                {promoter.email}
              </Text>
              {promoter.phone ? (
                <Text className="text-ink-muted text-xs" numberOfLines={1}>
                  {promoter.phone}
                </Text>
              ) : null}
            </View>
            <Badge label={promoter.supplier} tone="neutral" />
          </Card>
        ) : null}

        <Text className="text-ink font-bold text-base mb-2">Sincronização</Text>
        <Card className="gap-3 mb-4">
          <View className="flex-row items-center gap-2">
            <Feather
              name={pendingCount ? 'clock' : 'check-circle'}
              size={18}
              color={pendingCount ? colors.warning : colors.success}
            />
            <Text className="text-ink text-sm flex-1">
              {pendingCount === null
                ? 'Verificando...'
                : pendingCount === 0
                  ? 'Tudo sincronizado.'
                  : `${pendingCount} ${
                      pendingCount === 1 ? 'ação aguardando' : 'ações aguardando'
                    } conexão.`}
            </Text>
          </View>

          {pendingCount ? (
            <Button
              label="Sincronizar agora"
              variant="ghost"
              loading={isSyncing}
              onPress={syncNow}
            />
          ) : null}
        </Card>
      </View>

      <Button label="Sair" variant="ghost" onPress={() => signOut()} />
    </ScreenContainer>
  );
}
