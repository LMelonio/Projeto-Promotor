import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { RouteItem } from '@/models/DashboardSummary';
import { colors } from '@/theme';

const STATUS_ICON: Record<RouteItem['status'], keyof typeof Feather.glyphMap> = {
  completed: 'check-circle',
  in_progress: 'play-circle',
  scheduled: 'circle',
  cancelled: 'x-circle',
};

const STATUS_COLOR: Record<RouteItem['status'], string> = {
  completed: colors.success,
  in_progress: colors.brand,
  scheduled: colors.inkMuted,
  cancelled: colors.danger,
};

const STATUS_LABEL: Record<RouteItem['status'], string> = {
  completed: 'Concluída',
  in_progress: 'Em andamento',
  scheduled: 'Agendada',
  cancelled: 'Cancelada',
};

/** Uma linha do "Roteiro de hoje" — cliente, horário e status visual (ícone + texto, nunca só cor). */
export function RouteItemRow({ item, onPress }: { item: RouteItem; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3 border-b border-line active:bg-surface-bg"
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-ink font-semibold text-[15px]" numberOfLines={1}>
          {item.clientName}
        </Text>
        <Text className="text-ink-muted text-xs">
          {item.scheduledTime ? item.scheduledTime.slice(0, 5) : 'Sem horário definido'}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Feather name={STATUS_ICON[item.status]} size={15} color={STATUS_COLOR[item.status]} />
        <Text style={{ color: STATUS_COLOR[item.status] }} className="text-xs font-semibold">
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
    </Pressable>
  );
}
