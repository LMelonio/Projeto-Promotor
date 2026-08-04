import { fakeAuthRepository } from '../fakes/FakeAuthRepository';
import type { AuthSession, IAuthRepository } from '../interfaces/IAuthRepository';
import { useMockData } from '@/config/env';
import type { Promoter } from '@/models/Promoter';
import { supabase } from '@/services/supabase/client';

/**
 * Implementação concreta de autenticação sobre o Supabase.
 *
 * Fluxo de negócio: o login autentica via Supabase Auth (e-mail/senha) e, em
 * seguida, busca o registro correspondente em `lynkz.promoters` através de
 * `auth_user_id`. Isso é necessário porque nem todo usuário autenticado é
 * necessariamente um promotor ativo (ex.: contas de back-office) — a
 * aplicação mobile só deve liberar acesso quando esse vínculo existir e o
 * promotor estiver com status "active".
 */
class AuthRepository implements IAuthRepository {
  async signInWithPassword(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }
    if (!data.session) {
      throw new Error('Não foi possível iniciar a sessão. Tente novamente.');
    }

    const promoter = await this.fetchPromoterProfile(data.session.user.id);
    return { promoter, accessToken: data.session.access_token };
  }

  async getActiveSession(): Promise<AuthSession | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;

    try {
      const promoter = await this.fetchPromoterProfile(data.session.user.id);
      return { promoter, accessToken: data.session.access_token };
    } catch {
      // Sessão do Supabase válida, mas sem vínculo de promotor ativo — trata
      // como "sem sessão" para forçar novo login em vez de deixar o app
      // preso em um estado inconsistente.
      return null;
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  private async fetchPromoterProfile(authUserId: string): Promise<Promoter> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('promoters')
      .select('id, full_name, email, phone, supplier, status')
      .eq('auth_user_id', authUserId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new Error('Usuário autenticado, mas sem cadastro de promotor ativo vinculado.');
    }
    if (data.status !== 'active') {
      throw new Error('Seu cadastro de promotor está inativo. Fale com o administrador.');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      supplier: data.supplier,
      isActive: data.status === 'active',
    };
  }

  /**
   * Traduz mensagens técnicas do Supabase Auth para textos amigáveis em
   * pt-BR, sem nunca expor detalhes internos (stack trace, código de erro
   * cru) na interface — requisito de segurança (nenhuma exceção deve
   * vazar informação sensível para o usuário final).
   */
  private translateAuthError(message: string): string {
    if (message.toLowerCase().includes('invalid login credentials')) {
      return 'E-mail ou senha incorretos.';
    }
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
    }
    return 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.';
  }
}

/**
 * Modo mock (ver `docs/DECISIONS.md`, item 17): sem `.env` configurado, usa
 * `FakeAuthRepository` em vez da implementação real — nenhuma tela precisa
 * saber disso, já que ambas satisfazem `IAuthRepository`.
 */
export const authRepository: IAuthRepository = useMockData
  ? fakeAuthRepository
  : new AuthRepository();
