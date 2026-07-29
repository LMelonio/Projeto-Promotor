import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { NextVisitCard } from './components/NextVisitCard';
import { RouteItemRow } from './components/RouteItemRow';
import { useDashboardSummary, useNextVisit, useTodayRoute } from './useHomeData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KpiCard } from '@/components/ui/KpiCard';
import type { MainTabParamList } from '@/navigation/types';
import { formatCurrencyBRL, formatPercentage } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

/**
 * Home / Dashboard (wireframe "2 - Início").
 *
 * Ordem de blocos — decisão de produto já aprovada e travada, não deve ser
 * reordenada sem novo ciclo de aprovação:
 *   Saudação → Próxima Visita → Faturamento/Positivação → KPIs operacionais
 *   → Roteiro de hoje → Bottom Navigation.
 */
export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const promoter = useAuthStore((s) => s.promoter);
  const promoterId = promoter?.id;

  const summary = useDashboardSummary(promoterId);
  const nextVisit = useNextVisit(promoterId);
  const route = useTodayRoute(promoterId);

  const firstName = promoter?.fullName.split(' ')[0] ?? '';
  const isLoadingCritical = summary.isLoading;

  if (isLoadingCritical) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando seus indicadores..." />
      </ScreenContainer>
    );
  }

  if (summary.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível carregar seus indicadores agora."
          onRetry={() => summary.refetch()}
        />
      </ScreenContainer>
    );
  }

  const data = summary.data;

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-center justify-between mt-4 mb-5">
        <View>
          <Text className="text-ink-muted text-sm">Bom dia,</Text>
          <Text className="text-ink font-extrabold text-xl">{firstName}</Text>
        </View>
        <View className="flex-row gap-3">
          <Feather
            name="refresh-cw"
            size={20}
            color={colors.inkMuted}
            onPress={() => {
              summary.refetch();
              nextVisit.refetch();
              route.refetch();
            }}
          />
          <Feather name="bell" size={20} color={colors.inkMuted} />
        </View>
      </View>

      {nextVisit.data ? (
        <View className="mb-4">
          <NextVisitCard
            visit={nextVisit.data}
            onStartCheckIn={() => {
              // TODO (Fase 2): navegar direto para o Detalhe do Cliente/Check-in.
              // Por ora, a aba "Clientes" ainda não aceita parâmetro de rota —
              // isso entra junto da implementação real dessa tela.
              navigation.navigate('Clientes');
            }}
          />
        </View>
      ) : null}

      {data ? (
        <>
          <View className="flex-row gap-3 mb-3">
            <KpiCard label="Faturamento" value={formatCurrencyBRL(data.monthlyRevenue)} emphasis />
            <KpiCard label="Positivação" value={formatPercentage(data.positivationRate)} emphasis />
          </View>

          <View className="flex-row gap-3 mb-6">
            <KpiCard
              label="Visitas hoje"
              value={`${data.visitsDoneToday}/${data.visitsTotalToday}`}
            />
            <KpiCard label="Pendências" value={String(data.pendingCount)} />
            <KpiCard label="Tempo médio" value={`${data.averageVisitMinutes}min`} />
          </View>
        </>
      ) : null}

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink font-bold text-base">Roteiro de hoje</Text>
        <Text
          className="text-brand text-sm font-semibold"
          onPress={() => navigation.navigate('Clientes')}
        >
          Ver tudo
        </Text>
      </View>

      {route.isLoading ? (
        <LoadingState />
      ) : route.data && route.data.length > 0 ? (
        <View>
          {route.data.map((item) => (
            <RouteItemRow key={item.visitId} item={item} />
          ))}
        </View>
      ) : (
        <Text className="text-ink-muted text-sm py-4">Nenhuma visita agendada para hoje.</Text>
      )}
    </ScreenContainer>
  );
}
