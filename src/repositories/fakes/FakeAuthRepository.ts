import type { AuthSession, IAuthRepository } from '../interfaces/IAuthRepository';
import { FAKE_PROMOTER } from './fakeStore';

/**
 * Auth fictício (modo mock, ver `docs/DECISIONS.md` item 17): aceita
 * qualquer e-mail/senha e sempre autentica como `FAKE_PROMOTER` — não há
 * conta real para validar. `getActiveSession` sempre retorna `null` de
 * propósito, para que a tela de Login continue fazendo parte do fluxo
 * demonstrado (em vez de pular direto para a Home).
 */
class FakeAuthRepository implements IAuthRepository {
  private session: AuthSession | null = null;

  async signInWithPassword(_email: string, _password: string): Promise<AuthSession> {
    this.session = { promoter: FAKE_PROMOTER, accessToken: 'fake-token' };
    return this.session;
  }

  async getActiveSession(): Promise<AuthSession | null> {
    return null;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }

  async updatePassword(_currentPassword: string, _newPassword: string): Promise<void> {
    // Sem conta real para atualizar em modo mock — resolve como sucesso.
  }
}

export const fakeAuthRepository = new FakeAuthRepository();
