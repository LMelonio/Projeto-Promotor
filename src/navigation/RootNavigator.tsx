import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';

import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuthStore } from '@/stores/authStore';

/**
 * Ponto único de decisão "estou logado ou não" no app inteiro. Nenhuma tela
 * deve implementar essa checagem por conta própria — todas confiam que, se
 * estão renderizando dentro do fluxo Main, é porque há uma sessão de
 * promotor válida.
 */
export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (status === 'idle' || status === 'loading') {
    return <LoadingState message="Carregando..." />;
  }

  return (
    <NavigationContainer>
      {status === 'authenticated' ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
