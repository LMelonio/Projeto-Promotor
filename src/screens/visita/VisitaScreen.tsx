import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

/**
 * Placeholder do botão central elevado "Visita" da Bottom Navigation.
 * Na versão final, este atalho deve levar direto para o check-in da
 * próxima visita agendada (ou para a visita em andamento, se houver uma) —
 * comportamento a implementar junto do fluxo de Check-in (Fase 3).
 */
export function VisitaScreen() {
  return (
    <ScreenContainer>
      <Text className="text-ink font-extrabold text-xl mt-4">Visita</Text>
      <Text className="text-ink-muted mt-2">
        Nenhuma visita em andamento. O fluxo completo de check-in entra na próxima fase.
      </Text>
    </ScreenContainer>
  );
}
