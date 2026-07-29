import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { NextVisit } from '@/models/DashboardSummary';
import { daysAgoLabel } from '@/shared/utils/date';
import { colors } from '@/theme';

interface NextVisitCardProps {
  visit: NextVisit;
  onStartCheckIn: (visit: NextVisit) => void;
}

/**
 * Card "Próxima Visita" (wireframe "2 - Início"). O check-in em si NUNCA é
 * iniciado por aqui de fato — por decisão de produto já aprovada, o
 * check-in sempre parte da tela de Detalhe do Cliente. Este botão navega
 * para lá; a Fase 2 (Clientes) é quem implementa essa tela de destino.
 */
export function NextVisitCard({ visit, onStartCheckIn }: NextVisitCardProps) {
  return (
    <Card className="gap-3">
      <Text className="text-ink-muted text-xs font-semibold tracking-wide">PRÓXIMA VISITA</Text>

      <Text className="text-ink font-extrabold text-lg">{visit.clientName}</Text>

      {visit.rating !== null ? (
        <View className="flex-row gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Feather
              key={i}
              name="star"
              size={14}
              color={i < Math.round(visit.rating ?? 0) ? colors.warning : colors.line}
            />
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center gap-4">
        {visit.distanceKm !== null ? (
          <View className="flex-row items-center gap-1">
            <Feather name="map-pin" size={13} color={colors.inkMuted} />
            <Text className="text-ink-muted text-xs">{visit.distanceKm.toFixed(1)} km</Text>
          </View>
        ) : null}
        <Text className="text-ink-muted text-xs">
          Última visita{' '}
          {daysAgoLabel(
            visit.lastVisitDaysAgo != null
              ? new Date(Date.now() - visit.lastVisitDaysAgo * 86_400_000).toISOString()
              : null,
          )}
        </Text>
      </View>

      <Button
        label="Iniciar check-in"
        icon={<Feather name="map-pin" size={16} color="#FFFFFF" />}
        onPress={() => onStartCheckIn(visit)}
      />
    </Card>
  );
}
