import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SelectableList } from '@/components/ui/SelectableList';
import type { PerfilStackParamList } from '@/navigation/types';
import { usePreferencesStore, type Appearance } from '@/stores/preferencesStore';
import { useThemeColors } from '@/theme';

const OPTIONS: { value: Appearance; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'auto', label: 'Automático', icon: 'smartphone' },
];

/**
 * Aparência — seleciona e persiste a preferência de tema, e aplica de
 * verdade via `useThemeSync` (ver `docs/DECISIONS.md`, item 29).
 */
export function AparenciaScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();
  const colors = useThemeColors();
  const appearance = usePreferencesStore((s) => s.appearance);
  const setAppearance = usePreferencesStore((s) => s.setAppearance);

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
          Aparência
        </Text>
      </View>

      <SelectableList
        items={OPTIONS}
        value={appearance}
        onChange={setAppearance}
        className="mb-4"
      />

      <Text className="text-ink-muted text-xs">
        A preferência é salva neste aparelho e aplicada imediatamente. "Automático" segue o tema do
        sistema operacional.
      </Text>
    </ScreenContainer>
  );
}
