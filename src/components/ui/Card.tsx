import { View, type ViewProps } from 'react-native';

/**
 * Card — superfície branca, borda sutil e raio 16 (Design System §3.4).
 * Usado para agrupar qualquer informação relacionada: KPIs, dados do
 * cliente, itens de roteiro, etc. Evitar `elevation`/sombra forte — o
 * Design System define elevação discreta, reservando destaque visual para
 * o CTA principal de cada tela.
 */
export function Card({ className, children, ...viewProps }: ViewProps) {
  return (
    <View
      className={`bg-surface-card border border-line rounded-card p-4 ${className ?? ''}`}
      {...viewProps}
    >
      {children}
    </View>
  );
}
