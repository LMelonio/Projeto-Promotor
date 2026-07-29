/**
 * Configuração do Tailwind/NativeWind.
 *
 * As cores abaixo NÃO são escolhas livres — são os tokens do Design System
 * aprovado na Etapa 3 (extraídos da logo oficial + decisões de contraste/WCAG
 * validadas com o time de produto). Qualquer novo token de cor deve ser
 * discutido antes de entrar aqui, para não divergir do restante do handoff
 * (protótipo HTML, docx e pptx já entregues usam os mesmos valores).
 */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E11F1C', // Vermelho institucional — marca e ação primária. NUNCA usar para erro.
          pressed: '#991B1B', // Estado pressionado / apoio do vermelho de marca.
        },
        success: '#16A34A', // Adimplente, confirmações, check-in concluído.
        warning: '#F59E0B', // Pendências, sinal fraco, "em andamento".
        danger: '#EF4444', // Erro semântico — matiz distinta do vermelho de marca.
        ink: {
          DEFAULT: '#1C1917', // Texto principal.
          muted: '#78716C', // Texto secundário / metadados.
        },
        line: '#E7E5E4', // Bordas, divisores.
        surface: {
          bg: '#FAFAF9', // Fundo padrão de tela.
          card: '#FFFFFF', // Cards e elementos elevados.
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
