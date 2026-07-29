import { create } from 'zustand';

import type { Promoter } from '@/models/Promoter';
import { authRepository } from '@/repositories/implementations/AuthRepository';

/**
 * Por que Zustand (e não Context API "puro" ou Redux) para este estado:
 *
 * - Context API re-renderiza toda a árvore abaixo do Provider a cada
 *   mudança, a menos que se fragmente em múltiplos contexts — Zustand
 *   permite que cada componente assine só o pedaço de estado que usa
 *   (`useAuthStore((s) => s.promoter)`), evitando renders desnecessários.
 *   Isso importa em campo: o app roda em aparelhos variados, muitas vezes
 *   entry-level, então cada render evitado conta para bateria/fluidez.
 * - Redux traria muito boilerplate (actions, reducers, slices) para um
 *   estado de auth que é, na prática, pequeno e simples.
 * - Dados que vêm do servidor (dashboard, clientes, visitas) NÃO ficam aqui —
 *   isso é responsabilidade do React Query (cache, retry, invalidação).
 *   Este store guarda apenas estado de sessão local: quem está logado e o
 *   status de carregamento da autenticação.
 */
interface AuthState {
  promoter: Promoter | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  errorMessage: string | null;
  restoreSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  promoter: null,
  status: 'idle',
  errorMessage: null,

  restoreSession: async () => {
    set({ status: 'loading' });
    const session = await authRepository.getActiveSession();
    set(
      session
        ? { promoter: session.promoter, status: 'authenticated', errorMessage: null }
        : { promoter: null, status: 'unauthenticated', errorMessage: null },
    );
  },

  signIn: async (email: string, password: string) => {
    set({ status: 'loading', errorMessage: null });
    try {
      const session = await authRepository.signInWithPassword(email, password);
      set({ promoter: session.promoter, status: 'authenticated', errorMessage: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar.';
      set({ status: 'unauthenticated', errorMessage: message });
      throw err;
    }
  },

  signOut: async () => {
    await authRepository.signOut();
    set({ promoter: null, status: 'unauthenticated', errorMessage: null });
  },
}));
