import { ActivityIndicator, Text, View } from 'react-native';

import { useThemeColors } from '@/theme';

/**
 * Estado de carregamento simples e genérico (spinner + texto opcional).
 * Para listas específicas (ex.: cards de KPI), preferir um skeleton
 * dedicado no futuro — este componente cobre o caso geral de "tela
 * aguardando primeira carga de dados".
 */
export function LoadingState({ message }: { message?: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center gap-3 py-10">
      <ActivityIndicator color={colors.brand} size="large" />
      {message ? <Text className="text-ink-muted text-sm">{message}</Text> : null}
    </View>
  );
}
