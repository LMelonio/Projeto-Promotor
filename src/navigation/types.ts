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
  Checkin: { clientId: string; visitId: string };
};

/**
 * Stack aninhada dentro da aba "Visita" (Fase 3): checklist de Atividades da
 * visita em andamento → Questionário / Ruptura. Ambas as sub-telas derivam a
 * visita ativa de novo via `useActiveVisit` (mesmo dado, já em cache), então
 * não recebem parâmetros de rota.
 */
export type VisitaStackParamList = {
  VisitaAtiva: undefined;
  Questionario: undefined;
  FotosAtividade: undefined;
  Ruptura: undefined;
  Checkout: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Clientes: NavigatorScreenParams<ClientesStackParamList> | undefined;
  Visita: NavigatorScreenParams<VisitaStackParamList> | undefined;
  Historico: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
