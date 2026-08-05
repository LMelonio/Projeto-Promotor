import type { AppNotification } from '@/models/Notification';

export interface INotificationRepository {
  list(promoterId: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
}
