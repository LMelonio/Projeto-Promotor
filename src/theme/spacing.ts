/**
 * Escala de espaçamento base 4px, conforme Design System aprovado.
 * Usar sempre estes valores em vez de números "soltos" no código —
 * garante consistência visual entre todas as telas do app.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Raios de borda aprovados por tipo de componente. */
export const radii = {
  input: 12,
  card: 16,
  button: 16,
  pill: 999,
  deviceFrame: 28,
} as const;
