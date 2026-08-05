import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FINANCIAL_STATUS_LABEL, FINANCIAL_STATUS_TONE } from '@/models/Client';
import type { ClientListItem } from '@/models/Client';
import { daysAgoLabel } from '@/shared/utils/date';
import { colors } from '@/theme';

interface ClientCardProps {
  client: ClientListItem;
  onPress: () => void;
}

/** Card de um cliente na lista da carteira (wireframe "3 - Clientes"). */
export function ClientCard({ client, onPress }: ClientCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="gap-2 mb-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-ink font-bold text-[15px]" numberOfLines={1}>
              {client.tradeName}
            </Text>
            <Text className="text-ink-muted text-xs" numberOfLines={1}>
              Cód. {client.erpCode} · {client.neighborhood}
            </Text>
          </View>
          <Badge
            label={FINANCIAL_STATUS_LABEL[client.financialStatus]}
            tone={FINANCIAL_STATUS_TONE[client.financialStatus]}
          />
        </View>

        <View className="flex-row items-center justify-between">
          {client.rating !== null ? (
            <View className="flex-row gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Feather
                  key={i}
                  name="star"
                  size={12}
                  color={i < Math.round(client.rating ?? 0) ? colors.warning : colors.line}
                />
              ))}
            </View>
          ) : (
            <View />
          )}

          <View className="flex-row items-center gap-1">
            <Feather
              name={client.todayVisit ? 'calendar' : 'clock'}
              size={13}
              color={client.todayVisit ? colors.brand : colors.inkMuted}
            />
            <Text
              className={`text-xs ${client.todayVisit ? 'text-brand font-semibold' : 'text-ink-muted'}`}
            >
              {client.todayVisit
                ? client.todayVisit.scheduledTime
                  ? `Hoje às ${client.todayVisit.scheduledTime.slice(0, 5)}`
                  : 'Agendada para hoje'
                : `Última visita ${daysAgoLabel(
                    client.lastVisitDaysAgo != null
                      ? new Date(Date.now() - client.lastVisitDaysAgo * 86_400_000).toISOString()
                      : null,
                  )}`}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
