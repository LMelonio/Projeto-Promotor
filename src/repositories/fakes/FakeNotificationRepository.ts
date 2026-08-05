import type { INotificationRepository } from '../interfaces/INotificationRepository';
import { fakeNotifications, fakeStore } from './fakeStore';
import type { AppNotification } from '@/models/Notification';

/** Notificações fictícias (modo mock) — ver seed em `fakeStore.ts`. */
class FakeNotificationRepository implements INotificationRepository {
  async list(_promoterId: string): Promise<AppNotification[]> {
    return [...fakeNotifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markAsRead(notificationId: string): Promise<void> {
    fakeStore.markNotificationRead(notificationId);
  }
}

export const fakeNotificationRepository = new FakeNotificationRepository();
