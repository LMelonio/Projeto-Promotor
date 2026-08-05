import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { PerfilStackParamList } from '@/navigation/types';
import { useSyncStatus } from '@/services/sync/useSyncStatus';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const MENU_ITEMS: {
  route: keyof PerfilStackParamList;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}[] = [
  { route: 'AlterarSenha', icon: 'lock', label: 'Alterar senha' },
  { route: 'NotificacoesConfig', icon: 'bell', label: 'Notificações' },
  { route: 'Aparencia', icon: 'moon', label: 'Aparência' },
  { route: 'Ajuda', icon: 'help-circle', label: 'Ajuda e sobre' },
];

/**
 * Perfil completo (Fase 4): dados do promotor + status da fila de
 * sincronização offline (ver `services/sync`, atualizado ao focar a tela) +
 * logout. Cargo/cidade e o menu de configurações (Alterar senha/
 * Notificações/Aparência/Ajuda) adicionados a partir do wireframe real —
 * ver `docs/DECISIONS.md`, item 26.
 */
export function PerfilScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();
  const promoter = useAuthStore((s) => s.promoter);
  const signOut = useAuthStore((s) => s.signOut);
  const { pendingCount, isSyncing, syncNow, refresh } = useSyncStatus();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ScreenContainer scroll>
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
                {promoter.role} · {promoter.city}
              </Text>
              <Text className="text-ink-muted text-xs" numberOfLines={1}>
                {promoter.email}
              </Text>
            </View>
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

        <Text className="text-ink font-bold text-base mb-2">Configurações</Text>
        <Card className="gap-0.5 mb-4">
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              className={`flex-row items-center gap-3 py-3 ${
                index < MENU_ITEMS.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <Feather name={item.icon} size={18} color={colors.inkMuted} />
              <Text className="text-ink text-sm flex-1">{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.inkMuted} />
            </Pressable>
          ))}
        </Card>
      </View>

      <Button label="Sair" variant="ghost" onPress={() => signOut()} className="mt-2" />
    </ScreenContainer>
  );
}
