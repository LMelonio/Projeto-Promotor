import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { VisitaStackParamList } from './types';
import { QuestionarioScreen } from '@/screens/visita/QuestionarioScreen';
import { RupturaScreen } from '@/screens/visita/RupturaScreen';
import { VisitaScreen } from '@/screens/visita/VisitaScreen';

const Stack = createNativeStackNavigator<VisitaStackParamList>();

/**
 * Stack aninhada da aba "Visita" (Fase 3): checklist de Atividades da visita
 * em andamento → Questionário / Ruptura. Mesmo padrão de
 * `ClientesStackNavigator` (ver `docs/ARCHITECTURE.md`).
 */
export function VisitaStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VisitaAtiva" component={VisitaScreen} />
      <Stack.Screen name="Questionario" component={QuestionarioScreen} />
      <Stack.Screen name="Ruptura" component={RupturaScreen} />
    </Stack.Navigator>
  );
}
