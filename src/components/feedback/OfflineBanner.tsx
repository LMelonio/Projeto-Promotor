import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useThemeColors } from '@/theme';

/**
 * Banner persistente "Sem conexão · trabalhando offline" (wireframe da Home)
 * — o promotor não tinha como saber que estava offline só olhando a tela,
 * já que a sincronização acontece em silêncio (ver `docs/DECISIONS.md`,
 * item 27). Mostrado só quando `useNetworkStatus` reporta offline.
 */
export function OfflineBanner() {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2 bg-warning/10 rounded-input px-3 py-2.5 mb-4">
      <Feather name="wifi-off" size={16} color={colors.warning} />
      <Text className="text-warning text-xs font-semibold flex-1">
        Sem conexão · trabalhando offline
      </Text>
    </View>
  );
}
