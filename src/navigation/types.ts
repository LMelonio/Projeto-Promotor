import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Tipos centrais de navegação.
 * Mantidos em arquivo único para que qualquer novo navegador/tela aprovado
 * nas próximas fases (Clientes, Check-in, Atividades, Ruptura, Check-out...)
 * só precise adicionar uma linha aqui — sem espalhar tipos de rota pelo app.
 */

export type AuthStackParamList = {
  Login: undefined;
};

/**
 * Stack aninhada dentro da aba "Clientes" (Fase 2), conforme recomendado em
 * `docs/ARCHITECTURE.md` para telas de fluxo profundo dentro de uma tab.
 */
export type ClientesStackParamList = {
  ClientesList: undefined;
  ClienteDetalhe: { clientId: string };
};

export type MainTabParamList = {
  Inicio: undefined;
  Clientes: NavigatorScreenParams<ClientesStackParamList> | undefined;
  Visita: undefined;
  Historico: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
