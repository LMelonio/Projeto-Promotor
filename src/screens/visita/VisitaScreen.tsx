import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Pressable, Text, View } from 'react-native';

import { useActiveVisit, useActivities, useRegisterActivity } from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_CHECKLIST, type Activity } from '@/models/Activity';
import type { MainTabParamList, VisitaStackParamList } from '@/navigation/types';
import { elapsedLabel } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { useThemeColors } from '@/theme';

/**
 * Visita em andamento (wireframe "6-Atividades", Documentação Funcional):
 * checklist de 4 itens — Questionário de PDV, Fotos da gôndola, Verificação
 * de preços (mandatório, assumido — ver `models/Activity.ts`) e Registro de
 * ruptura (opcional). Reescrito a partir da documentação real — ver
 * `docs/DECISIONS.md`, item 21.
 *
 * Simplificação assumida: o checklist mostra só Pendente/Concluída — o
 * progresso parcial de "Fotos da gôndola" (ex.: "1 de 3") fica local à tela
 * de captura enquanto ela está aberta, não é persistido entre navegações.
 */
export function VisitaScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const colors = useThemeColors();
  const promoterId = useAuthStore((s) => s.promoter?.id);

  const activeVisit = useActiveVisit(promoterId);
  const visitId = activeVisit.data?.visitId;

  const activities = useActivities(visitId);
  const registerActivity = useRegisterActivity(visitId);

  if (activeVisit.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Verificando visita em andamento..." />
      </ScreenContainer>
    );
  }

  if (activeVisit.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Não foi possível verificar a visita agora."
          onRetry={() => activeVisit.refetch()}
        />
      </ScreenContainer>
    );
  }

  if (!activeVisit.data) {
    return (
      <ScreenContainer>
        <Text className="text-ink font-extrabold text-xl mt-4">Visita</Text>
        <Text className="text-ink-muted mt-2 mb-4">
          Nenhuma visita em andamento. Faça o check-in a partir do Detalhe do Cliente para começar.
        </Text>
        <Button label="Ver Clientes" variant="ghost" onPress={handleGoToClientes} />
      </ScreenContainer>
    );
  }

  const visit = activeVisit.data;
  const byKind = new Map((activities.data ?? []).map((a): [string, Activity] => [a.kind, a]));
  const completedCount = ACTIVITY_CHECKLIST.filter((item) => byKind.has(item.kind)).length;
  const pendingMandatory = ACTIVITY_CHECKLIST.filter(
    (item) => item.mandatory && !byKind.has(item.kind),
  ).length;
  const canFinish = pendingMandatory === 0;

  function handleGoToClientes() {
    navigation.getParent<NavigationProp<MainTabParamList>>()?.navigate('Clientes');
  }

  async function handlePriceCheckToggle() {
    if (!activeVisit.data || !promoterId) return;
    await registerActivity.mutateAsync({
      clientId: activeVisit.data.clientId,
      promoterId,
      kind: 'price_check',
      photoCount: 0,
    });
  }

  function handlePressItem(kind: (typeof ACTIVITY_CHECKLIST)[number]['kind']) {
    if (byKind.has(kind)) return;
    if (kind === 'questionnaire') navigation.navigate('Questionario');
    else if (kind === 'photos') navigation.navigate('FotosAtividade');
    else if (kind === 'ruptura') navigation.navigate('Ruptura');
    else if (kind === 'price_check') handlePriceCheckToggle();
  }

  return (
    <ScreenContainer scroll>
      <View className="mt-4 mb-5">
        <Text className="text-ink font-extrabold text-xl" numberOfLines={1}>
          {visit.clientName}
        </Text>
        <Text className="text-ink-muted text-sm mt-0.5">
          Visita em andamento · {elapsedLabel(visit.checkedInAt)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink font-bold text-base">Atividades</Text>
        <Text className="text-ink-muted text-xs">
          {completedCount} de {ACTIVITY_CHECKLIST.length} concluídas
        </Text>
      </View>

      <View className="h-1.5 rounded-full bg-line mb-4 overflow-hidden">
        <View
          className="h-full rounded-full bg-brand"
          style={{ width: `${(completedCount / ACTIVITY_CHECKLIST.length) * 100}%` }}
        />
      </View>

      <Card className="gap-0.5 mb-4">
        {ACTIVITY_CHECKLIST.map((item, index) => {
          const activity = byKind.get(item.kind);
          const done = Boolean(activity);

          return (
            <Pressable
              key={item.kind}
              disabled={done}
              onPress={() => handlePressItem(item.kind)}
              className={`flex-row items-center justify-between py-3 ${
                index < ACTIVITY_CHECKLIST.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Feather
                  name={done ? 'check-circle' : 'circle'}
                  size={20}
                  color={done ? colors.success : colors.inkMuted}
                />
                <View className="flex-1">
                  <Text className="text-ink text-sm" numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text className="text-ink-muted text-xs mt-0.5">
                    {done
                      ? item.kind === 'photos'
                        ? `Concluída · ${activity?.photoCount} foto(s)`
                        : 'Concluída'
                      : item.mandatory
                        ? 'Pendente'
                        : 'Opcional · Pendente'}
                  </Text>
                </View>
              </View>
              {!done ? (
                <Feather
                  name={item.kind === 'photos' ? 'camera' : 'chevron-right'}
                  size={18}
                  color={colors.inkMuted}
                />
              ) : null}
            </Pressable>
          );
        })}
      </Card>

      <Button
        label="Finalizar visita"
        variant="success"
        disabled={!canFinish}
        onPress={() => navigation.navigate('Checkout')}
      />
      {!canFinish ? (
        <Text className="text-ink-muted text-xs text-center mt-2">
          Conclua {pendingMandatory} atividade{pendingMandatory === 1 ? '' : 's'} obrigatória
          {pendingMandatory === 1 ? '' : 's'}
        </Text>
      ) : null}
    </ScreenContainer>
  );
}
