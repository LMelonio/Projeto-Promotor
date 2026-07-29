import { Text, View } from 'react-native';

import { Card } from './Card';

interface KpiCardProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

/**
 * Card compacto de indicador único, usado em linha na Home
 * (ex.: "3/8 Visitas hoje", "2 Pendências", "12min Tempo médio").
 * `emphasis` deixa o valor em destaque maior — usado nos dois indicadores
 * comerciais (Faturamento, Positivação), que têm prioridade visual sobre os
 * operacionais, conforme decisão aprovada de ordenação da Home.
 */
export function KpiCard({ label, value, emphasis = false }: KpiCardProps) {
  return (
    <Card className="flex-1 items-start gap-1">
      <Text
        className={`text-ink font-extrabold ${emphasis ? 'text-2xl' : 'text-lg'}`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <View>
        <Text className="text-ink-muted text-xs" numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Card>
  );
}
