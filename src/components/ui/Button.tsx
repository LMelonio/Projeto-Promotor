import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { useThemeColors } from '@/theme';

type Variant = 'primary' | 'ghost' | 'success';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Botão base do app. Especificação (Design System §3.4):
 * altura 56, cantos 16, largura total no rodapé de telas de fluxo.
 * - primary: preenchido em vermelho de marca — ação principal da tela.
 * - ghost: contorno — ação secundária.
 * - success: preenchido em verde — usado em confirmações (ex.: "Confirmar check-in").
 */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  className,
  ...pressableProps
}: ButtonProps) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-brand active:bg-brand-pressed',
    ghost: 'bg-transparent border border-line active:bg-surface-bg',
    success: 'bg-success active:opacity-90',
  };

  const textColor: Record<Variant, string> = {
    primary: '#FFFFFF',
    ghost: colors.ink,
    success: '#FFFFFF',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`h-14 rounded-button flex-row items-center justify-center gap-2 px-5 ${
        variantClasses[variant]
      } ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <>
          {icon}
          <Text
            style={{ color: textColor[variant] }}
            className="text-[15px] font-semibold"
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
