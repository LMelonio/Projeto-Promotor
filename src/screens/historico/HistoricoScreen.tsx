import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

export function HistoricoScreen() {
  return (
    <ScreenContainer>
      <Text className="text-ink font-extrabold text-xl mt-4">Histórico</Text>
      <Text className="text-ink-muted mt-2">
        Histórico de visitas (Hoje / 7 dias / 30 dias) — implementação prevista para fase futura.
      </Text>
    </ScreenContainer>
  );
}
