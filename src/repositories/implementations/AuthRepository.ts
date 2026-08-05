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

  /**
   * O SDK do Supabase Auth não expõe uma checagem isolada de "senha atual" —
   * `updateUser` troca a senha de qualquer sessão já autenticada, sem pedir a
   * anterior. Por isso a reautenticação com `signInWithPassword` acontece
   * aqui antes de trocar: é a própria confirmação de que quem está pedindo a
   * troca realmente sabe a senha atual.
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user.email;
    if (!email) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      throw new Error('Senha atual incorreta.');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error('Não foi possível alterar sua senha agora. Tente novamente.');
    }
  }

  /**
   * Não trata erro do Supabase de forma diferente por e-mail
   * inválido/inexistente — sempre resolve normalmente, para não revelar a um
   * atacante se um e-mail está cadastrado (enumeração de contas).
   */
  async resetPasswordForEmail(email: string): Promise<void> {
    await supabase.auth.resetPasswordForEmail(email);
  }

  private async fetchPromoterProfile(authUserId: string): Promise<Promoter> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('promoters')
      .select('id, full_name, email, phone, supplier, role, city, status')
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
      role: data.role,
      city: data.city,
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
