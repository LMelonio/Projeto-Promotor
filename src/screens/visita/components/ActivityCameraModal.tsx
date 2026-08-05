import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface ActivityCameraModalProps {
  visible: boolean;
  activityLabel: string;
  minPhotos?: number;
  onCancel: () => void;
  onConfirm: (photoUris: string[]) => void;
}

/**
 * Captura das fotos obrigatórias de uma atividade/ruptura — câmera ao vivo
 * via `expo-camera`, nunca seleção de galeria (decisão registrada em
 * `docs/DECISIONS.md`, item 8: a integridade do dado enviado ao BI depende
 * de a foto ser da visita real).
 *
 * Devolve as URIs capturadas (não só a contagem) para telas que precisam
 * mostrar miniaturas de verdade (ex.: `FotosAtividadeScreen`). As imagens
 * ficam só na memória local do componente que chama este modal — o upload
 * dos binários para o Storage remoto continua fora de escopo (ver
 * `docs/DECISIONS.md`, item 13).
 */
export function ActivityCameraModal({
  visible,
  activityLabel,
  minPhotos = 1,
  onCancel,
  onConfirm,
}: ActivityCameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, skipProcessing: true });
    if (photo?.uri) {
      setPhotoUris((uris) => [...uris, photo.uri]);
    }
  }

  function handleCancel() {
    setPhotoUris([]);
    onCancel();
  }

  function handleConfirm() {
    const uris = photoUris;
    setPhotoUris([]);
    onConfirm(uris);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <View className="flex-1 bg-black">
        {!permission?.granted ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <Text className="text-white text-center text-[15px]">
              A câmera é necessária para registrar a foto obrigatória de "{activityLabel}".
            </Text>
            <Button label="Permitir câmera" onPress={requestPermission} />
            <Pressable onPress={handleCancel}>
              <Text className="text-white/70 text-sm">Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

            <View className="absolute top-0 left-0 right-0 pt-14 px-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleCancel}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
              <Text
                className="text-white text-sm font-semibold flex-1 text-center mx-2"
                numberOfLines={1}
              >
                {activityLabel}
              </Text>
              <View className="w-10" />
            </View>

            <View className="absolute bottom-0 left-0 right-0 pb-10 pt-6 items-center gap-4">
              <Text className="text-white text-xs">
                {photoUris.length} foto{photoUris.length === 1 ? '' : 's'} capturada
                {photoUris.length === 1 ? '' : 's'} · mínimo {minPhotos}
              </Text>
              <View className="flex-row items-center gap-10">
                <Pressable
                  onPress={handleCapture}
                  accessibilityLabel="Capturar foto"
                  className="w-[72px] h-[72px] rounded-full bg-white border-4 border-white/40"
                />
                <Pressable
                  onPress={handleConfirm}
                  disabled={photoUris.length < minPhotos}
                  accessibilityLabel="Concluir captura"
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    photoUris.length < minPhotos ? 'bg-white/20' : 'bg-success'
                  }`}
                >
                  <Feather name="check" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
