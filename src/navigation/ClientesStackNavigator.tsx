import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { ClientesStackParamList } from './types';
import { CheckinScreen } from '@/screens/clientes/CheckinScreen';
import { ClienteDetalheScreen } from '@/screens/clientes/ClienteDetalheScreen';
import { ClientesScreen } from '@/screens/clientes/ClientesScreen';

const Stack = createNativeStackNavigator<ClientesStackParamList>();

/**
 * Stack aninhada da aba "Clientes" (Fase 2): lista da carteira → Detalhe do
 * Cliente/Check-in. Padrão recomendado em `docs/ARCHITECTURE.md` para toda
 * tela de fluxo profundo dentro de uma tab.
 */
export function ClientesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientesList" component={ClientesScreen} />
      <Stack.Screen name="ClienteDetalhe" component={ClienteDetalheScreen} />
      <Stack.Screen name="Checkin" component={CheckinScreen} />
    </Stack.Navigator>
  );
}
