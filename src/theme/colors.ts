/**
 * Paleta oficial do Lynkz Promotor.
 *
 * Fonte da verdade: Design System aprovado na Etapa 3 (mesmos hex usados no
 * protótipo HTML navegável e no documento .docx de handoff). Mantido em
 * sincronia manual com `tailwind.config.js` — se um mudar, o outro muda junto.
 *
 * Regra de negócio herdada do design: o vermelho de marca (`brand`) é
 * reservado para identidade e ações principais; ele NUNCA deve ser usado
 * para comunicar erro. Erros usam sempre `danger` (#EF4444) + ícone + texto,
 * nunca cor isolada (requisito de acessibilidade WCAG 2.2 AA).
 */
export const colors = {
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
} as const;

export type ColorToken = keyof typeof colors;
