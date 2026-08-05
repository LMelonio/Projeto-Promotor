import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useActiveVisit, useActivities, useClientRupturas } from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_CHECKLIST } from '@/models/Activity';
import {
  VISIT_OUTCOME_LABEL,
  VISIT_OUTCOMES,
  VISIT_REASON_LABEL,
  VISIT_REASONS,
  type VisitOutcome,
  type VisitReason,
} from '@/models/Visit';
import type { VisitaStackParamList } from '@/navigation/types';
import { useCheckOut } from '@/screens/clientes/useClientesData';
import { useLocation } from '@/shared/hooks/useLocation';
import { formatDurationMinutes, minutesBetween } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

/**
 * Check-out (wireframe "10-Check-out", Documentação Funcional): resumo da
 * visita + seleção de motivo e resultado antes de confirmar — substitui o
 * check-out direto de um toque assumido nas fases anteriores (ver
 * `docs/DECISIONS.md`, item 22).
 *
 * Aproximação assumida: a contagem de rupturas usa `reportedAt` >=
 * `checkedInAt` da visita ativa como proxy, já que `Ruptura` não guarda
 * `visitId` — ver mesmo item de decisão.
 */
export function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);

  const activeVisit = useActiveVisit(promoterId);
  const visitId = activeVisit.data?.visitId;
  const clientId = activeVisit.data?.clientId;

  const activities = useActivities(visitId);
  const rupturas = useClientRupturas(clientId);
  const checkOut = useCheckOut(promoterId, clientId);
  const { requestLocation, errorMessage: locationError } = useLocation();

  const [reason, setReason] = useState<VisitReason | null>(null);
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null);

  if (activeVisit.isLoading || activities.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando resumo da visita..." />
      </ScreenContainer>
    );
  }

  if (!activeVisit.data) {
    return (
      <ScreenContainer>
        <ErrorState message="Nenhuma visita em andamento." onRetry={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const visit = activeVisit.data;
  const activitiesDone = activities.data?.length ?? 0;
  const photoCount = (activities.data ?? []).reduce((sum, a) => sum + a.photoCount, 0);
  const rupturaCount = (rupturas.data ?? []).filter(
    (r) => r.reportedAt >= visit.checkedInAt,
  ).length;
  const durationMinutes = minutesBetween(visit.checkedInAt, new Date().toISOString());

  const canConfirm = Boolean(reason && outcome);

  async function handleConfirm() {
    if (!reason || !outcome) return;
    const coords = await requestLocation();
    if (!coords) return;
    await checkOut.mutateAsync({ visitId: visit.visitId, coords, reason, outcome });
    navigation.goBack();
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
          Check-out
        </Text>
      </View>

      <Text className="text-ink-muted text-xs font-bold mb-2 uppercase">Resumo da visita</Text>
      <Card className="mb-6">
        <View className="flex-row items-center justify-between py-2 border-b border-line">
          <Text className="text-ink-muted text-sm">Duração</Text>
          <Text className="text-ink text-sm font-semibold">
            {formatDurationMinutes(durationMinutes)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between py-2 border-b border-line">
          <Text className="text-ink-muted text-sm">Atividades</Text>
          <Text className="text-ink text-sm font-semibold">
            {activitiesDone} de {ACTIVITY_CHECKLIST.length}
          </Text>
        </View>
        <View className="flex-row items-center justify-between py-2 border-b border-line">
          <Text className="text-ink-muted text-sm">Fotos</Text>
          <Text className="text-ink text-sm font-semibold">{photoCount}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-ink-muted text-sm">Rupturas</Text>
          <Text className="text-ink text-sm font-semibold">{rupturaCount}</Text>
        </View>
      </Card>

      <Text className="text-ink-muted text-xs font-bold mb-2 uppercase">Motivo da visita</Text>
      <Card className="gap-0.5 mb-6">
        {VISIT_REASONS.map((option, index) => {
          const isSelected = reason === option;
          return (
            <Pressable
              key={option}
              onPress={() => setReason(option)}
              className={`flex-row items-center gap-3 py-3 ${
                index < VISIT_REASONS.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <Feather
                name={isSelected ? 'check-circle' : 'circle'}
                size={20}
                color={isSelected ? colors.brand : colors.inkMuted}
              />
              <Text className="text-ink text-sm flex-1">{VISIT_REASON_LABEL[option]}</Text>
            </Pressable>
          );
        })}
      </Card>

      <Text className="text-ink-muted text-xs font-bold mb-2 uppercase">Resultado da visita</Text>
      <Card className="gap-0.5 mb-6">
        {VISIT_OUTCOMES.map((option, index) => {
          const isSelected = outcome === option;
          return (
            <Pressable
              key={option}
              onPress={() => setOutcome(option)}
              className={`flex-row items-center gap-3 py-3 ${
                index < VISIT_OUTCOMES.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <Feather
                name={isSelected ? 'check-circle' : 'circle'}
                size={20}
                color={isSelected ? colors.brand : colors.inkMuted}
              />
              <Text className="text-ink text-sm flex-1">{VISIT_OUTCOME_LABEL[option]}</Text>
            </Pressable>
          );
        })}
      </Card>

      {checkOut.isError || locationError ? (
        <Text className="text-danger text-xs mb-3">
          {locationError ?? 'Não foi possível concluir o check-out agora. Tente novamente.'}
        </Text>
      ) : null}

      <Button
        label="Concluir check-out"
        variant="success"
        disabled={!canConfirm}
        loading={checkOut.isPending}
        onPress={handleConfirm}
      />
      <Text className="text-ink-muted text-xs text-center mt-3">
        Sincroniza automaticamente quando houver conexão.
      </Text>
    </ScreenContainer>
  );
}
