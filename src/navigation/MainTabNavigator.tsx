import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ClientesStackNavigator } from './ClientesStackNavigator';
import { ElevatedTabButton } from './ElevatedTabButton';
import { PerfilStackNavigator } from './PerfilStackNavigator';
import { VisitaStackNavigator } from './VisitaStackNavigator';
import type { MainTabParamList } from './types';
import { HistoricoScreen } from '@/screens/historico/HistoricoScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Cinco itens fixos (decisão aprovada, não é configurável por perfil):
 * Início, Clientes, Visita (central, elevado), Histórico, Perfil.
 * Apenas Início está com a implementação final nesta fase — os demais são
 * placeholders com a navegação já funcional, prontos para receber o
 * conteúdo completo nas próximas fases aprovadas.
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesStackNavigator}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Visita"
        component={VisitaStackNavigator}
        options={{
          title: '',
          tabBarButton: (props) => <ElevatedTabButton onPress={props.onPress ?? undefined} />,
        }}
      />
      <Tab.Screen
        name="Historico"
        component={HistoricoScreen}
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => <Feather name="clock" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
