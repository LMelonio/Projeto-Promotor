/**
 * Tipos centrais de navegação.
 * Mantidos em arquivo único para que qualquer novo navegador/tela aprovado
 * nas próximas fases (Clientes, Check-in, Atividades, Ruptura, Check-out...)
 * só precise adicionar uma linha aqui — sem espalhar tipos de rota pelo app.
 */

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Clientes: undefined;
  Visita: undefined;
  Historico: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
