import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SelectableList } from '@/components/ui/SelectableList';
import type { PerfilStackParamList } from '@/navigation/types';
import { usePreferencesStore, type Appearance } from '@/stores/preferencesStore';
import { colors } from '@/theme';

const OPTIONS: { value: Appearance; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'auto', label: 'Automático', icon: 'smartphone' },
];

/**
 * Aparência — seleciona e persiste a preferência de tema. O app ainda não
 * recolore com o tema escolhido (ver `docs/DECISIONS.md`, item 26, para o
 * motivo).
 */
export function AparenciaScreen() {
  const navigation = useNavigation<NavigationProp<PerfilStackParamList>>();
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
        A preferência é salva neste aparelho. O app ainda usa o tema claro em todas as telas — o
        suporte completo ao modo escuro está planejado para uma próxima etapa.
      </Text>
    </ScreenContainer>
  );
}
