/**
 * Escala tipográfica aprovada no Design System (Etapa 3).
 *
 * Fonte: pilha de fontes nativas do sistema (system font), pela legibilidade
 * consistente em telas pequenas e sob luz solar direta — mesma decisão usada
 * no protótipo HTML (`-apple-system, Segoe UI, Roboto, Arial, sans-serif`).
 * Em React Native isso equivale a não sobrescrever `fontFamily` (usa a fonte
 * padrão da plataforma: San Francisco no iOS, Roboto no Android).
 */
export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 }, // valores de destaque (hora do check-in, faturamento)
  title: { fontSize: 20, fontWeight: '800' as const, lineHeight: 26 }, // título de tela / saudação
  subtitle: { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 }, // nome de cliente, seções
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 }, // conteúdo e listas
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 }, // labels, chips
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 }, // apoio, metadados
} as const;

export type TypographyToken = keyof typeof typography;
