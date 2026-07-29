/**
 * Utilitários de data usados nas telas de Home/Cliente.
 * Mantidos pequenos e puros (fáceis de testar isoladamente).
 */

/** Formata "há N dias" a partir de uma data ISO. Retorna "hoje" para o dia atual. */
export function daysAgoLabel(isoDate: string | null): string {
  if (!isoDate) return 'sem registro';

  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  return `há ${diffDays} dias`;
}

/** Formata valores monetários em Real (BRL), sem casas decimais — como usado nos KPIs da Home. */
export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

/** Formata uma taxa 0–1 como percentual inteiro (ex.: 0.42 -> "42%"). */
export function formatPercentage(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
