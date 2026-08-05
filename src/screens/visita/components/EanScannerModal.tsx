import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface EanScannerModalProps {
  visible: boolean;
  onCancel: () => void;
  onScanned: (ean: string) => void;
}

/**
 * Leitura de código EAN via câmera (wireframe "Registro de Rupturas / Fotos",
 * Documentação Funcional: "Localizar produtos (incluindo leitura de EAN)").
 * Fecha sozinho no primeiro código lido — usa um `ref` (não state) para
 * evitar múltiplos disparos de `onBarcodeScanned` antes do modal fechar.
 */
export function EanScannerModal({ visible, onCancel, onScanned }: EanScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  function handleBarcodeScanned(result: { data: string }) {
    if (handledRef.current) return;
    handledRef.current = true;
    onScanned(result.data);
  }

  function handleCancel() {
    handledRef.current = false;
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
      onShow={() => {
        handledRef.current = false;
      }}
    >
      <View className="flex-1 bg-black">
        {!permission?.granted ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <Text className="text-white text-center text-[15px]">
              A câmera é necessária para ler o código de barras (EAN) do produto.
            </Text>
            <Button label="Permitir câmera" onPress={requestPermission} />
            <Pressable onPress={handleCancel}>
              <Text className="text-white/70 text-sm">Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View className="absolute top-0 left-0 right-0 pt-14 px-4 flex-row items-center justify-between">
              <Pressable
                onPress={handleCancel}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
              <Text className="text-white text-sm font-semibold flex-1 text-center mx-2">
                Aponte para o código EAN
              </Text>
              <View className="w-10" />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
