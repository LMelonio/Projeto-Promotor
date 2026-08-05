import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ActivityCameraModal } from './components/ActivityCameraModal';
import { useActiveVisit, useRegisterActivity } from './useVisitaData';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { ACTIVITY_CHECKLIST } from '@/models/Activity';
import type { VisitaStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

const PHOTOS_ITEM = ACTIVITY_CHECKLIST.find((item) => item.kind === 'photos');
const REQUIRED_COUNT = PHOTOS_ITEM?.requiredPhotoCount ?? 1;

/**
 * Fotos da atividade (wireframe "8-Fotos", Documentação Funcional): grade de
 * miniaturas com contador e slots obrigatórios — substitui o contador
 * simples da Fase 3 (sem galeria de revisão), que não refletia o wireframe
 * real (ver `docs/DECISIONS.md`, item 21).
 *
 * Simplificação assumida: sem status de sincronização por foto — o binário
 * da imagem segue não sendo enviado ao Storage remoto nesta fase (mesma
 * decisão nº 13), então um selo "Sincronizado" por foto seria enganoso.
 */
export function FotosAtividadeScreen() {
  const navigation = useNavigation<NavigationProp<VisitaStackParamList>>();
  const promoterId = useAuthStore((s) => s.promoter?.id);
  const activeVisit = useActiveVisit(promoterId);
  const registerActivity = useRegisterActivity(activeVisit.data?.visitId);

  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  async function handleConfirmPhotos(uris: string[]) {
    setCameraOpen(false);
    setPhotos((prev) => [...prev, ...uris]);
  }

  async function handleFinish() {
    if (!activeVisit.data || !promoterId || photos.length < REQUIRED_COUNT) return;
    await registerActivity.mutateAsync({
      clientId: activeVisit.data.clientId,
      promoterId,
      kind: 'photos',
      photoCount: photos.length,
    });
    navigation.goBack();
  }

  if (activeVisit.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Carregando..." />
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

  const missing = Math.max(0, REQUIRED_COUNT - photos.length);
  const slots = Math.max(REQUIRED_COUNT, photos.length);

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
          {PHOTOS_ITEM?.label ?? 'Fotos'}
        </Text>
        <Text className="text-ink-muted text-sm">
          {photos.length} de {REQUIRED_COUNT}
        </Text>
      </View>

      <Text className="text-ink-muted text-xs mb-3">Fotos obrigatórias</Text>

      <View className="flex-row flex-wrap gap-3 mb-6">
        {Array.from({ length: slots }).map((_, index) => {
          const uri = photos[index];
          return (
            <View
              key={index}
              className="w-[104px] h-[104px] rounded-card border border-line bg-surface-card items-center justify-center overflow-hidden"
            >
              {uri ? (
                <Image
                  source={{ uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center gap-1">
                  <Feather name="camera" size={20} color={colors.inkMuted} />
                  <Text className="text-ink-muted text-[10px]">Obrigatória</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Button
        label="Tirar foto"
        icon={<Feather name="camera" size={16} color="#FFFFFF" />}
        onPress={() => setCameraOpen(true)}
        className="mb-3"
      />

      {registerActivity.isError ? (
        <Text className="text-danger text-xs mb-3">
          Não foi possível salvar a atividade agora. Tente novamente.
        </Text>
      ) : null}

      <Button
        label="Concluir"
        variant="success"
        disabled={missing > 0}
        loading={registerActivity.isPending}
        onPress={handleFinish}
      />
      {missing > 0 ? (
        <Text className="text-ink-muted text-xs text-center mt-2">
          Falta {missing} foto{missing === 1 ? '' : 's'} obrigatória{missing === 1 ? '' : 's'}
        </Text>
      ) : null}

      <ActivityCameraModal
        visible={cameraOpen}
        activityLabel={PHOTOS_ITEM?.label ?? 'Fotos'}
        minPhotos={1}
        onCancel={() => setCameraOpen(false)}
        onConfirm={handleConfirmPhotos}
      />
    </ScreenContainer>
  );
}
