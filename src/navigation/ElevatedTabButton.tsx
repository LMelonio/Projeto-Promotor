import { Feather } from '@expo/vector-icons';
import { Pressable, View, type GestureResponderEvent } from 'react-native';

import { colors } from '@/theme';

/**
 * Botão central elevado "Visita" da Bottom Navigation — decisão aprovada do
 * Design System (5 itens, item central elevado, sem rótulo de texto embaixo
 * dele por já ter destaque visual suficiente). Implementado como
 * `tabBarButton` customizado no `MainTabNavigator`.
 */
export function ElevatedTabButton({ onPress }: { onPress?: (e: GestureResponderEvent) => void }) {
  return (
    <View className="items-center justify-center -top-5">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Iniciar visita"
        className="w-16 h-16 rounded-full bg-brand items-center justify-center shadow-lg active:bg-brand-pressed"
        style={{
          shadowColor: colors.brand,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Feather name="map-pin" size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
