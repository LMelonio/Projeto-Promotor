import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { largeSecureStore } from './secureStorageAdapter';
import { env } from '@/config/env';
import type { Database } from '@/types/supabase.types';

/**
 * Cliente Supabase — instância ÚNICA da aplicação.
 *
 * Regra de arquitetura: nenhuma tela ou componente deve importar isto
 * diretamente. O acesso a dados deve sempre passar pela camada de
 * Repositories (`src/repositories`), que expõe interfaces e esconde este
 * detalhe de implementação. Isso permite trocar o backend no futuro (ou
 * mockar em teste) sem tocar em nenhuma tela.
 *
 * `Database` é o tipo gerado a partir do schema real via
 * `npm run gen:types` (ver package.json). Enquanto o projeto Supabase não
 * está conectado neste ambiente de scaffold, o arquivo
 * `src/types/supabase.types.ts` contém uma definição mínima manual — ela
 * DEVE ser substituída pelo tipo gerado antes de ir para produção.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * O SDK do Supabase só atualiza o token automaticamente enquanto o app está
 * em primeiro plano. Este listener garante que o auto-refresh pausa/retoma
 * corretamente quando o app vai para background — evitando sessões expiradas
 * "silenciosamente" quando o promotor volta ao app depois de um tempo.
 */
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
