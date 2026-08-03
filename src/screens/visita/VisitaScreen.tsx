import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityCameraModal } from './components/ActivityCameraModal';
import {
  useActiveVisit,
  useActivities,
  useQuestionnaire,
  useRegisterActivity,
} from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABEL, type ActivityType } from '@/models/Activity';
import type { MainTabParamList, VisitaStackParamList } from '@/navigation/types';
import { useCheckOut } from '@/screens/clientes/useClientesData';
import { useLocation } from '@/shared/hooks/useLocation';
import { elapsedLabel } from '@/shared/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

/**
 * Visita em andamento (wireframe "Atividades", Fase 3): checklist dos seis
 * tipos fixos de atividade — cada um exige ao menos 1 foto capturada na
 * hora (nunca da galeria, decisão nº 8) — mais atalhos para Questionário e
 * Ruptura. Sem visita com check-in feito, mostra apenas o atalho para a
 * carteira de Clientes.
 */
export function VisitaScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);

  const activeVisit = useActiveVisit(promoterId);
  const visitId = activeVisit.data?.visitId;

  const activities = useActivities(visitId);
  const questionnaire = useQuestionnaire(visitId);
  const registerActivity = useRegisterActivity(visitId);
  const checkOut = useCheckOut(promoterId, activeVisit.data?.clientId);
  const { requestLocation, errorMessage: locationError } = useLocation();

  const [cameraType, setCameraType] = useState<ActivityType | null>(null);

  function handleGoToClientes() {
    navigation.getParent<NavigationProp<MainTabParamList>>()?.navigate('Clientes');
  }

  async function handleConfirmPhotos(photoCount: number) {
    const type = cameraType;
    setCameraType(null);
    if (!type || !activeVisit.data || !promoterId) return;

    await registerActivity.mutateAsync({
      clientId: activeVisit.data.clientId,
      promoterId,
      type,
      photoCount,
    });
  }

  async function handleCheckOut() {
    if (!activeVisit.data) return;

    const coords = await requestLocation();
    if (!coords) return;

    await checkOut.mutateAsync({ visitId: activeVisit.data.visitId, coords });
  }

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
  const completedByType = new Map((activities.data ?? []).map((a) => [a.type, a]));

  return (
    <ScreenContainer scroll>
      <View className="flex-row items-start justify-between gap-3 mt-4 mb-5">
        <View className="flex-1">
          <Text className="text-ink font-extrabold text-xl" numberOfLines={1}>
            {visit.clientName}
          </Text>
          <Text className="text-ink-muted text-sm mt-0.5">
            Visita em andamento · {elapsedLabel(visit.checkedInAt)}
          </Text>
        </View>
        <Button
          label="Finalizar visita"
          variant="success"
          loading={checkOut.isPending}
          onPress={handleCheckOut}
        />
      </View>

      {checkOut.isError || locationError ? (
        <Text className="text-danger text-xs mb-3">
          {locationError ?? 'Não foi possível finalizar a visita agora. Tente novamente.'}
        </Text>
      ) : null}

      <Text className="text-ink font-bold text-base mb-2">Atividades</Text>
      <Card className="gap-0.5 mb-4">
        {ACTIVITY_TYPES.map((type, index) => {
          const activity = completedByType.get(type);
          const done = Boolean(activity);

          return (
            <Pressable
              key={type}
              disabled={done}
              onPress={() => setCameraType(type)}
              className={`flex-row items-center justify-between py-3 ${
                index < ACTIVITY_TYPES.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Feather
                  name={done ? 'check-circle' : 'circle'}
                  size={20}
                  color={done ? colors.success : colors.inkMuted}
                />
                <Text className="text-ink text-sm flex-1" numberOfLines={1}>
                  {ACTIVITY_TYPE_LABEL[type]}
                </Text>
              </View>
              {done ? (
                <Text className="text-ink-muted text-xs">{activity?.photoCount} foto(s)</Text>
              ) : (
                <Feather name="camera" size={18} color={colors.inkMuted} />
              )}
            </Pressable>
          );
        })}
      </Card>

      <Pressable onPress={() => navigation.navigate('Questionario')}>
        <Card className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <Feather name="clipboard" size={20} color={colors.ink} />
            <Text className="text-ink text-sm font-semibold">Questionário da visita</Text>
          </View>
          {questionnaire.data ? (
            <Badge label="Respondido" tone="success" />
          ) : (
            <Feather name="chevron-right" size={20} color={colors.inkMuted} />
          )}
        </Card>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Ruptura')}>
        <Card className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <Feather name="alert-triangle" size={20} color={colors.ink} />
            <Text className="text-ink text-sm font-semibold">Registrar ruptura</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.inkMuted} />
        </Card>
      </Pressable>

      <ActivityCameraModal
        visible={cameraType !== null}
        activityLabel={cameraType ? ACTIVITY_TYPE_LABEL[cameraType] : ''}
        onCancel={() => setCameraType(null)}
        onConfirm={handleConfirmPhotos}
      />
    </ScreenContainer>
  );
}
