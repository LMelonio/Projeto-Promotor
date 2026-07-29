import { Text, View } from 'react-native';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  tone: BadgeTone;
  icon?: React.ReactNode;
}

const toneClasses: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  danger: { bg: 'bg-danger/10', text: 'text-danger' },
  neutral: { bg: 'bg-ink-muted/10', text: 'text-ink-muted' },
};

/**
 * Badge de status (Adimplente/Inadimplente, sincronização, resultado da
 * visita, etc.). Regra de acessibilidade OBRIGATÓRIA do Design System:
 * nenhum estado pode ser comunicado apenas por cor — por isso este
 * componente sempre recebe um `label` textual, e aceita opcionalmente um
 * ícone. Nunca usar Badge sem texto.
 */
export function Badge({ label, tone, icon }: BadgeProps) {
  const { bg, text } = toneClasses[tone];
  return (
    <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-pill ${bg}`}>
      {icon}
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
