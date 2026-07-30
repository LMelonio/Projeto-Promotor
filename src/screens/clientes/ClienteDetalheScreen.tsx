import { Feather } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useCheckIn, useClient, useTodayVisit } from './useClientesData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { VisitStatus } from '@/models/Client';
import type { ClientesStackParamList } from '@/navigation/types';
import { useLocation } from '@/shared/hooks/useLocation';
import { distanceKm, formatDistance } from '@/shared/utils/geo';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const STATUS_LABEL: Record<VisitStatus, string> = {
  scheduled: 'Agendada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const STATUS_TONE: Record<VisitStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  scheduled: 'neutral',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

/**
 * Detalhe do Cliente + início do Check-in georreferenciado (Fase 2).
 * O check-in captura uma leitura nova de GPS no momento do toque — nunca
 * localização em cache, ver `useLocation` — e grava a coordenada junto do
 * horário. O check-out completo entra na Fase 4.
 */
export function ClienteDetalheScreen() {
  const navigation = useNavigation<NavigationProp<ClientesStackParamList>>();
  const { params } = useRoute<RouteProp<ClientesStackParamList, 'ClienteDetalhe'>>();
  const { clientId } = params;

  const promoterId = useAuthStore((s) => s.promoter?.id);
  const client = useClient(clientId);
  const todayVisit = useTodayVisit(promoterId, clientId);
  const checkIn = useCheckIn(promoterId, clientId);
  const { requestLocation, errorMessage: locationError } = useLocation();

  const [checkInDistanceKm, setCheckInDistanceKm] = useState<number | null>(null);

  async function handleCheckIn() {
    if (!todayVisit.data) return;

    const coords = await requestLocation();
    if (!coords) return;

    await checkIn.mutateAsync({ visitId: todayVisit.data.visitId, coords });

    if (client.data) {
      setCheckInDistanceKm(
        distanceKm(coords, { latitude: client.data.latitude, longitude: client.data.longitude }),
      );
    }
  }

  if (client.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando dados do cliente..." />
      </ScreenContainer>
    );
  }

  if (client.isError || !client.data) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível carregar este cliente agora."
          onRetry={() => client.refetch()}
        />
      </ScreenContainer>
    );
  }

  const data = client.data;
  const visit = todayVisit.data;

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
          {data.tradeName}
        </Text>
      </View>

      <Card className="gap-3 mb-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-ink-muted text-xs">{data.legalName}</Text>
            <Text className="text-ink-muted text-xs">Cód. ERP {data.erpCode}</Text>
          </View>
          <Badge
            label={data.financialStatus === 'compliant' ? 'Adimplente' : 'Inadimplente'}
            tone={data.financialStatus === 'compliant' ? 'success' : 'danger'}
          />
        </View>

        {data.rating !== null ? (
          <View className="flex-row gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Feather
                key={i}
                name="star"
                size={14}
                color={i < Math.round(data.rating ?? 0) ? colors.warning : colors.line}
              />
            ))}
          </View>
        ) : null}
      </Card>

      <Text className="text-ink font-bold text-base mb-2">Visita de hoje</Text>

      <Card className="gap-3 mb-4">
        {todayVisit.isLoading ? (
          <LoadingState />
        ) : !visit ? (
          <Text className="text-ink-muted text-sm">
            Nenhuma visita agendada para hoje com este cliente.
          </Text>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="text-ink text-sm">
                {visit.scheduledTime
                  ? `Agendada para ${visit.scheduledTime.slice(0, 5)}`
                  : 'Sem horário definido'}
              </Text>
              <Badge label={STATUS_LABEL[visit.status]} tone={STATUS_TONE[visit.status]} />
            </View>

            {visit.status === 'scheduled' ? (
              <Button
                label="Iniciar check-in"
                icon={<Feather name="map-pin" size={16} color="#FFFFFF" />}
                loading={checkIn.isPending}
                onPress={handleCheckIn}
              />
            ) : null}

            {visit.status === 'in_progress' && visit.checkedInAt ? (
              <View className="gap-1">
                <Text className="text-success text-sm font-semibold">
                  Check-in feito às{' '}
                  {new Date(visit.checkedInAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {checkInDistanceKm !== null ? (
                  <Text className="text-ink-muted text-xs">
                    Distância registrada até o cliente: {formatDistance(checkInDistanceKm)}
                  </Text>
                ) : null}
                <Text className="text-ink-muted text-xs">
                  Check-out disponível na próxima fase.
                </Text>
              </View>
            ) : null}

            {visit.status === 'scheduled' && (checkIn.isError || locationError) ? (
              <Text className="text-danger text-xs">
                {locationError ?? 'Não foi possível registrar o check-in agora. Tente novamente.'}
              </Text>
            ) : null}
          </>
        )}
      </Card>
    </ScreenContainer>
  );
}
