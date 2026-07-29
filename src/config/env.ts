/**
 * Leitura centralizada das variáveis de ambiente.
 *
 * Por que este arquivo existe: em vez de espalhar `process.env.EXPO_PUBLIC_*`
 * pelo código (o que dificulta saber "quais envs o app usa" e quebra em
 * runtime de forma confusa), centralizamos aqui com validação explícita.
 * Se uma env obrigatória faltar, o app falha imediatamente na inicialização
 * com uma mensagem clara — não em algum ponto aleatório do fluxo de visita.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] Variável obrigatória ausente: ${name}. Copie ".env.example" para ".env" e preencha os valores do projeto Supabase.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: requireEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
} as const;
