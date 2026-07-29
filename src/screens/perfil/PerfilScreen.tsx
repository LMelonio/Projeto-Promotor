import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

/**
 * Versão mínima da tela de Perfil: já implementa o logout de verdade (ação
 * real, não placeholder), pois é necessário para poder testar o fluxo de
 * login novamente durante o desenvolvimento. O restante (fila de
 * sincronização, alterar senha, notificações) entra na fase de sistema/pós-visita.
 */
export function PerfilScreen() {
  const promoter = useAuthStore((s) => s.promoter);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <ScreenContainer className="justify-between pb-6">
      <Text className="text-ink font-extrabold text-xl mt-4">Perfil</Text>
      {promoter ? (
        <Text className="text-ink-muted mt-2">
          {promoter.fullName} · {promoter.email}
        </Text>
      ) : null}
      <Button label="Sair" variant="ghost" onPress={() => signOut()} className="mt-auto" />
    </ScreenContainer>
  );
}
