import { fakeNotificationRepository } from '../fakes/FakeNotificationRepository';
import type { INotificationRepository } from '../interfaces/INotificationRepository';
import { useMockData } from '@/config/env';
import type { AppNotification } from '@/models/Notification';
import { supabase } from '@/services/supabase/client';

/** Camada de dados de Notificações — ver aviso de schema assumido em `types/supabase.types.ts`. */
class NotificationRepository implements INotificationRepository {
  async list(promoterId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .schema('lynkz')
      .from('notifications')
      .select('id, kind, title, body, created_at, read_at')
      .eq('promoter_id', promoterId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      createdAt: n.created_at,
      read: n.read_at !== null,
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .schema('lynkz')
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
  }
}

/** Modo mock (ver `docs/DECISIONS.md`, item 17): ver mesmo padrão em `AuthRepository.ts`. */
export const notificationRepository: INotificationRepository = useMockData
  ? fakeNotificationRepository
  : new NotificationRepository();
