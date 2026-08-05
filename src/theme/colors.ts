import { useColorScheme } from 'nativewind';

/**
 * Paleta oficial do Lynkz Promotor.
 *
 * Fonte da verdade: Design System aprovado na Etapa 3 (mesmos hex usados no
 * protótipo HTML navegável e no documento .docx de handoff). Mantido em
 * sincronia manual com `tailwind.config.js`/`global.css` — se um mudar, os
 * outros mudam junto.
 *
 * Regra de negócio herdada do design: o vermelho de marca (`brand`) é
 * reservado para identidade e ações principais; ele NUNCA deve ser usado
 * para comunicar erro. Erros usam sempre `danger` + ícone + texto, nunca cor
 * isolada (requisito de acessibilidade WCAG 2.2 AA) — em ambos os temas.
 *
 * Por que dois objetos e não CSS variables aqui também: estes valores
 * alimentam a prop `color` de ícones (Feather) e estilos inline, que
 * precisam de uma cor resolvida de verdade — CSS variables (usadas pelas
 * classNames Tailwind, ver `tailwind.config.js`) não ajudam aqui. `colors` é
 * mantido como o tema claro (import direto, sem hook, para o raro caso de
 * uso fora de um componente); `useThemeColors()` é a versão reativa que
 * qualquer tela deve usar — ver `docs/DECISIONS.md`, item 29.
 */
interface ThemeColors {
  brand: string;
  brandPressed: string;
  success: string;
  warning: string;
  danger: string;
  ink: string;
  inkMuted: string;
  line: string;
  surfaceBg: string;
  surfaceCard: string;
}

export const lightColors: ThemeColors = {
  brand: '#E11F1C',
  brandPressed: '#991B1B',
  success: '#16A34A', // Adimplente / confirmações
  warning: '#F59E0B', // Pendências / em andamento
  danger: '#EF4444', // Erro semântico (distinto do brand)
  ink: '#1C1917', // Texto principal
  inkMuted: '#78716C', // Texto secundário / metadados
  line: '#E7E5E4', // Bordas e divisores
  surfaceBg: '#FAFAF9', // Fundo padrão de tela
  surfaceCard: '#FFFFFF', // Cards e elementos elevados
};

/** Mesmos tokens, valores para tema escuro — mesma paleta do artefato de comparativo desta sessão. */
export const darkColors: ThemeColors = {
  brand: '#E11F1C',
  brandPressed: '#991B1B',
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#F87171',
  ink: '#F2EFEA',
  inkMuted: '#A8A199',
  line: '#34302C',
  surfaceBg: '#191614',
  surfaceCard: '#211D1A',
};

export type ColorToken = keyof typeof lightColors;

/** Tema claro — usar `useThemeColors()` em componentes; isto é só o valor estático de fallback. */
export const colors = lightColors;

/** Cores do tema ativo no momento, reagindo à preferência de Aparência (ver `stores/preferencesStore.ts`). */
export function useThemeColors(): typeof lightColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}
