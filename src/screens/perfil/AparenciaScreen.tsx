import { Feather } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Pressable, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import type { PerfilStackParamList } from '@/navigation/types';
import { usePreferencesStore, type Appearance } from '@/stores/preferencesStore';
import { colors } from '@/theme';

const OPTIONS: { key: Appearance; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'light', label: 'Claro', icon: 'sun' },
  { key: 'dark', label: 'Escuro', icon: 'moon' },
  { key: 'auto', label: 'Automático', icon: 'smartphone' },
];

/**
 * Aparência — seleciona e persiste a preferência de tema (ver
 * `docs/DECISIONS.md`, item 26). Assunção documentada: o app continua com as
 * cores fixas em tema claro em todas as outras telas — trocar aqui não
 * recolore o app ainda, ver o mesmo item de decisão para o motivo.
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

      <Card className="gap-0.5 mb-4">
        {OPTIONS.map((option, index) => {
          const isSelected = appearance === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setAppearance(option.key)}
              className={`flex-row items-center gap-3 py-3 ${
                index < OPTIONS.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <Feather name={option.icon} size={18} color={colors.inkMuted} />
              <Text className="text-ink text-sm flex-1">{option.label}</Text>
              <Feather
                name={isSelected ? 'check-circle' : 'circle'}
                size={20}
                color={isSelected ? colors.brand : colors.inkMuted}
              />
            </Pressable>
          );
        })}
      </Card>

      <Text className="text-ink-muted text-xs">
        A preferência é salva neste aparelho. O app ainda usa o tema claro em todas as telas — o
        suporte completo ao modo escuro está planejado para uma próxima etapa.
      </Text>
    </ScreenContainer>
  );
}
