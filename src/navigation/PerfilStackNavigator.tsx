import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { PerfilStackParamList } from './types';
import { AjudaScreen } from '@/screens/perfil/AjudaScreen';
import { AlterarSenhaScreen } from '@/screens/perfil/AlterarSenhaScreen';
import { AparenciaScreen } from '@/screens/perfil/AparenciaScreen';
import { NotificacoesConfigScreen } from '@/screens/perfil/NotificacoesConfigScreen';
import { PerfilScreen } from '@/screens/perfil/PerfilScreen';

const Stack = createNativeStackNavigator<PerfilStackParamList>();

/**
 * Stack aninhada da aba "Perfil": tela principal → Alterar senha /
 * Notificações / Aparência / Ajuda. Mesmo padrão de `ClientesStackNavigator`
 * (ver `docs/ARCHITECTURE.md`) — ver `docs/DECISIONS.md`, item 26.
 */
export function PerfilStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilHome" component={PerfilScreen} />
      <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
      <Stack.Screen name="NotificacoesConfig" component={NotificacoesConfigScreen} />
      <Stack.Screen name="Aparencia" component={AparenciaScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
    </Stack.Navigator>
  );
}
