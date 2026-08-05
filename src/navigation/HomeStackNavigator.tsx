import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { HomeStackParamList } from './types';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { NotificacoesScreen } from '@/screens/notificacoes/NotificacoesScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Stack aninhada da aba "Início": Home → Notificações. Mesmo padrão de
 * `ClientesStackNavigator` (ver `docs/ARCHITECTURE.md`) — ver
 * `docs/DECISIONS.md`, item 27.
 */
export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
    </Stack.Navigator>
  );
}
