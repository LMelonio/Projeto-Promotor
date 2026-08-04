/**
 * Leitura centralizada das variáveis de ambiente.
 *
 * Por que este arquivo existe: em vez de espalhar `process.env.EXPO_PUBLIC_*`
 * pelo código (o que dificulta saber "quais envs o app usa" e quebra em
 * runtime de forma confusa), centralizamos aqui com validação explícita.
 * Se uma env obrigatória faltar, o app falha imediatamente na inicialização
 * com uma mensagem clara — não em algum ponto aleatório do fluxo de visita.
 *
 * Exceção deliberada: se NENHUMA das duas envs do Supabase estiver definida
 * (nunca se copiou ".env.example" para ".env"), entendemos como "ainda não
 * há projeto Supabase real" e ativamos `useMockData` — os Repositories
 * passam a usar implementações fictícias (`repositories/fakes`) em vez de
 * falhar. Se só UMA das duas estiver definida, isso é config quebrada de
 * verdade (não modo mock) e continua falhando alto, como antes. Ver
 * `docs/DECISIONS.md`, item 17.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[env] Variável obrigatória ausente: ${name}. Copie ".env.example" para ".env" e preencha os valores do projeto Supabase.`,
    );
  }
  return value;
}

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const useMockData = !rawSupabaseUrl && !rawSupabaseAnonKey;

export const env = useMockData
  ? {
      supabaseUrl: 'https://mock.supabase.co',
      supabaseAnonKey: 'mock-anon-key',
    }
  : {
      supabaseUrl: requireEnv('EXPO_PUBLIC_SUPABASE_URL', rawSupabaseUrl),
      supabaseAnonKey: requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', rawSupabaseAnonKey),
    };
