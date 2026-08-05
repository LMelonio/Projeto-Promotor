import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Switch, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import type { PerfilStackParamList } from '@/navigation/types';
import { usePreferencesStore, type NotificationPreferences } from '@/stores/preferencesStore';
import { colors } from '@/theme';

const OPTIONS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: 'addressApproval',
    label: 'Aprovação de endereço',
    description: 'Avisos de aprovação/recusa de atualização de endereço de cliente',
  },
  {
    key: 'visitReminders',
    label: 'Lembretes de visita',
    description: 'Avisos de visitas agendadas para hoje',
  },
  {
    key: 'appUpdates',
    label: 'Atualizações do app',
    description: 'Novidades e correções do Lynkz Promotor',
  },
];

/** Notificações — configuração de quais avisos o promotor recebe (ver `docs/DECISIONS.md`, item 26). */
export function NotificacoesConfigScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();
  const notifications = usePreferencesStore((s) => s.notifications);
  const toggleNotification = usePreferencesStore((s) => s.toggleNotification);

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
          Notificações
        </Text>
      </View>

      <Card className="gap-0.5">
        {OPTIONS.map((option, index) => (
          <View
            key={option.key}
            className={`flex-row items-center gap-3 py-3 ${
              index < OPTIONS.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <View className="flex-1">
              <Text className="text-ink text-sm font-semibold">{option.label}</Text>
              <Text className="text-ink-muted text-xs mt-0.5">{option.description}</Text>
            </View>
            <Switch
              value={notifications[option.key]}
              onValueChange={() => toggleNotification(option.key)}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </Card>
    </ScreenContainer>
  );
}
