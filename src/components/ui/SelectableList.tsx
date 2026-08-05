import { Feather } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { Card } from './Card';
import { useThemeColors } from '@/theme';

export interface SelectableListItem<T> {
  value: T;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
}

interface SelectableListProps<T> {
  items: SelectableListItem<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Card com uma lista de opções de escolha única (label + indicador
 * check-circle/circle) — mesmo padrão visual repetido em Questionário,
 * Check-out (motivo/resultado) e Aparência. Extraído para um componente só
 * depois de aparecer de forma idêntica 4 vezes.
 */
export function SelectableList<T>({ items, value, onChange, className }: SelectableListProps<T>) {
  const colors = useThemeColors();
  return (
    <Card className={`gap-0.5 ${className ?? ''}`}>
      {items.map((item, index) => {
        const isSelected = value === item.value;
        return (
          <Pressable
            key={String(item.value)}
            onPress={() => onChange(item.value)}
            className={`flex-row items-center gap-3 py-3 ${
              index < items.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            {item.icon ? <Feather name={item.icon} size={18} color={colors.inkMuted} /> : null}
            <Text className="text-ink text-sm flex-1">{item.label}</Text>
            <Feather
              name={isSelected ? 'check-circle' : 'circle'}
              size={20}
              color={isSelected ? colors.brand : colors.inkMuted}
            />
          </Pressable>
        );
      })}
    </Card>
  );
}
