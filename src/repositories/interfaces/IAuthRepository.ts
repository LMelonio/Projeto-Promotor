import type { Promoter } from '@/models/Promoter';

export interface AuthSession {
  promoter: Promoter;
  accessToken: string;
}

/**
 * Contrato de autenticação. Qualquer tela ou store deve depender apenas
 * desta interface — nunca da implementação concreta (`AuthRepository`) nem
 * do cliente Supabase diretamente. Isso permite, por exemplo, criar um
 * `FakeAuthRepository` para testes de tela sem precisar de rede.
 */
export interface IAuthRepository {
  signInWithPassword(email: string, password: string): Promise<AuthSession>;
  getActiveSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
}
