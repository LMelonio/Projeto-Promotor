import { Feather } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useCheckIn, useClient } from './useClientesData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ClientesStackParamList, MainTabParamList } from '@/navigation/types';
import { useLiveLocation } from '@/shared/hooks/useLiveLocation';
import { distanceKm, formatDistance } from '@/shared/utils/geo';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

/**
 * Abaixo de 200m o ícone de proximidade fica verde — limiar só visual, sem
 * gate de distância (a documentação não exige um raio mínimo para o check-in,
 * ver `docs/DECISIONS.md`, item 24).
 */
const PROXIMITY_HIGHLIGHT_KM = 0.2;

function useLiveClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Check-in dedicado (wireframe "Check-in", Documentação Funcional): relógio
 * ao vivo + indicador de proximidade em tempo real antes de confirmar —
 * substitui o botão dentro do Detalhe do Cliente, que só capturava o GPS no
 * toque e mostrava a distância depois de já ter confirmado (ver
 * `docs/DECISIONS.md`, item 24).
 */
export function CheckinScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientesStackParamList>>();
  const { params } = useRoute<RouteProp<ClientesStackParamList, 'Checkin'>>();
  const { clientId, visitId } = params;

  const promoterId = useAuthStore((s) => s.promoter?.id);
  const client = useClient(clientId);
  const checkIn = useCheckIn(promoterId, clientId);
  const { status: locationStatus, coords, errorMessage: locationError } = useLiveLocation();
  const now = useLiveClock();

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
  const distance = coords
    ? distanceKm(coords, { latitude: data.latitude, longitude: data.longitude })
    : null;

  /**
   * Vai direto para o checklist de Atividades da visita (aba "Visita") em
   * vez de voltar ao Detalhe do Cliente — é o próximo passo natural do
   * fluxo, e evitar o "Ir para Visita" extra também evita deixar o stack de
   * Clientes parado no cliente/tela de check-in (repro real: a aba
   * "Clientes" ficava travada nesse cliente até o fim da visita).
   */
  async function handleConfirm() {
    if (!coords) return;
    await checkIn.mutateAsync({ visitId, coords });
    navigation.popToTop();
    navigation.getParent<NavigationProp<MainTabParamList>>()?.navigate('Visita');
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
          Check-in
        </Text>
      </View>

      <Text className="text-ink-muted text-sm mb-1">Você está fazendo check-in em</Text>
      <Text className="text-ink font-bold text-lg mb-6" numberOfLines={1}>
        {data.tradeName}
      </Text>

      <Card className="items-center gap-2 mb-4 py-8">
        <Feather name="clock" size={22} color={colors.inkMuted} />
        <Text className="text-ink font-extrabold text-4xl tabular-nums">{formatClock(now)}</Text>
        <Text className="text-ink-muted text-xs">
          {now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
      </Card>

      <Card className="items-center gap-2 mb-6 py-8">
        <Feather
          name="map-pin"
          size={22}
          color={
            distance !== null && distance < PROXIMITY_HIGHLIGHT_KM ? colors.success : colors.warning
          }
        />
        {locationStatus === 'requesting' ? (
          <Text className="text-ink-muted text-sm">Obtendo sua localização...</Text>
        ) : distance !== null ? (
          <>
            <Text className="text-ink font-bold text-base">
              Você está a ~{formatDistance(distance)} do cliente
            </Text>
            <Text className="text-ink-muted text-xs text-center">
              A localização é atualizada em tempo real até você confirmar
            </Text>
          </>
        ) : (
          <Text className="text-danger text-sm text-center">
            {locationError ?? 'Não foi possível obter sua localização agora.'}
          </Text>
        )}
      </Card>

      {checkIn.isError ? (
        <Text className="text-danger text-xs mb-3 text-center">
          Não foi possível registrar o check-in agora. Tente novamente.
        </Text>
      ) : null}

      <Button
        label="Confirmar check-in"
        icon={<Feather name="check" size={16} color="#FFFFFF" />}
        variant="success"
        disabled={!coords}
        loading={checkIn.isPending}
        onPress={handleConfirm}
      />
    </ScreenContainer>
  );
}
