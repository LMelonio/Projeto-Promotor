import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useMarkNotificationRead, useNotifications } from './useNotificacoesData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import type { AppNotification, NotificationKind } from '@/models/Notification';
import type { HomeStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const KIND_ICON: Record<NotificationKind, keyof typeof Feather.glyphMap> = {
  address_approved: 'check-circle',
  address_rejected: 'x-circle',
  visit_reminder: 'calendar',
  generic: 'info',
};

const KIND_COLOR: Record<NotificationKind, string> = {
  address_approved: colors.success,
  address_rejected: colors.danger,
  visit_reminder: colors.brand,
  generic: colors.inkMuted,
};

function daysAgo(iso: string): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
}

function dayGroupLabel(iso: string): string {
  const age = daysAgo(iso);
  if (age <= 0) return 'Hoje';
  if (age === 1) return 'Ontem';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(
  notifications: AppNotification[],
): { label: string; items: AppNotification[] }[] {
  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const notification of notifications) {
    const label = dayGroupLabel(notification.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(notification);
    } else {
      groups.push({ label, items: [notification] });
    }
  }
  return groups;
}

/**
 * Notificações (wireframe "Notificações"): itens lidos/não lidos agrupados
 * por dia — descoberto a partir dos exemplos "Endereço aprovado"/"Endereço
 * recusado" (fluxo de aprovação de atualização de endereço de cliente), ver
 * `docs/DECISIONS.md`, item 27.
 */
export function NotificacoesScreen() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const notifications = useNotifications(promoterId);
  const markAsRead = useMarkNotificationRead(promoterId);

  const groups = useMemo(() => groupByDay(notifications.data ?? []), [notifications.data]);

  if (notifications.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando notificações..." />
      </ScreenContainer>
    );
  }

  if (notifications.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível carregar as notificações agora."
          onRetry={() => notifications.refetch()}
        />
      </ScreenContainer>
    );
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
          Notificações
        </Text>
      </View>

      {groups.length === 0 ? (
        <Text className="text-ink-muted text-sm py-8 text-center">
          Nenhuma notificação por aqui ainda.
        </Text>
      ) : (
        groups.map((group) => (
          <View key={group.label} className="mb-4">
            <Text className="text-ink-muted text-xs font-bold mb-2 uppercase">{group.label}</Text>
            <Card className="gap-0.5">
              {group.items.map((notification, index) => (
                <Pressable
                  key={notification.id}
                  onPress={() => !notification.read && markAsRead.mutate(notification.id)}
                  className={`flex-row items-start gap-3 py-3 ${
                    index < group.items.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <Feather
                    name={KIND_ICON[notification.kind]}
                    size={18}
                    color={KIND_COLOR[notification.kind]}
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-sm ${notification.read ? 'text-ink-muted' : 'text-ink font-semibold'}`}
                    >
                      {notification.title}
                    </Text>
                    <Text className="text-ink-muted text-xs mt-0.5">{notification.body}</Text>
                    <Text className="text-ink-muted text-[11px] mt-1">
                      {formatTime(notification.createdAt)}
                    </Text>
                  </View>
                  {!notification.read ? (
                    <View className="w-2 h-2 rounded-full bg-brand mt-1.5" />
                  ) : null}
                </Pressable>
              ))}
            </Card>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}
