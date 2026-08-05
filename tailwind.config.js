/**
 * Configuração do Tailwind/NativeWind.
 *
 * As cores abaixo NÃO são escolhas livres — são os tokens do Design System
 * aprovado na Etapa 3 (extraídos da logo oficial + decisões de contraste/WCAG
 * validadas com o time de produto). Qualquer novo token de cor deve ser
 * discutido antes de entrar aqui, para não divergir do restante do handoff
 * (protótipo HTML, docx e pptx já entregues usam os mesmos valores).
 *
 * `darkMode: 'class'` + cores via `rgb(var(--color-x) / <alpha-value>)`:
 * cada token aponta para uma CSS variable (definida em `global.css`, valores
 * diferentes em `:root` e `.dark`) em vez de um hex fixo — assim toda classe
 * Tailwind já usada nas telas (bg-surface-bg, text-ink, bg-brand/10...) troca
 * de valor sozinha quando o modo escuro é ativado via `colorScheme.set()`
 * (nativewind), sem precisar de nenhuma classe "dark:" espalhada pelo app.
 * Ver `docs/DECISIONS.md`, item 29.
 */
function withOpacity(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity('--color-brand'), // Vermelho institucional — marca e ação primária. NUNCA usar para erro.
          pressed: withOpacity('--color-brand-pressed'), // Estado pressionado / apoio do vermelho de marca.
        },
        success: withOpacity('--color-success'), // Adimplente, confirmações, check-in concluído.
        warning: withOpacity('--color-warning'), // Pendências, sinal fraco, "em andamento".
        danger: withOpacity('--color-danger'), // Erro semântico — matiz distinta do vermelho de marca.
        ink: {
          DEFAULT: withOpacity('--color-ink'), // Texto principal.
          muted: withOpacity('--color-ink-muted'), // Texto secundário / metadados.
        },
        line: withOpacity('--color-line'), // Bordas, divisores.
        surface: {
          bg: withOpacity('--color-surface-bg'), // Fundo padrão de tela.
          card: withOpacity('--color-surface-card'), // Cards e elementos elevados.
        },
      },
      borderRadius: {
        input: '12px',
        card: '16px',
        pill: '999px',
      },
      spacing: {
        // Escala base 4px usada em todo o protótipo (4/8/12/16/20/24).
        '4.5': '18px',
      },
    },
  },
  plugins: [],
};
