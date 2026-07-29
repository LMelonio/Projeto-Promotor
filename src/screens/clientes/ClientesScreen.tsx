import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

/**
 * Placeholder da Fase 2 (Clientes / Roteiro).
 * Estrutura de navegação e design system já preparados — a implementação
 * completa (busca, filtros "Roteiro do dia" / "Adimplente", lista de
 * carteira) entra na próxima etapa aprovada, seguindo o wireframe "3 - Clientes".
 */
export function ClientesScreen() {
  return (
    <ScreenContainer>
      <Text className="text-title text-ink font-extrabold text-xl mt-4">Clientes</Text>
      <Text className="text-ink-muted mt-2">
        Lista de clientes e roteiro — implementação prevista para a próxima fase.
      </Text>
    </ScreenContainer>
  );
}
