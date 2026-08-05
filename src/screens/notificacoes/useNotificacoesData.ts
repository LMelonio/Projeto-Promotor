import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AppNotification } from '@/models/Notification';
import { notificationRepository } from '@/repositories/implementations/NotificationRepository';

/** Hook de dados de Notificações — mesmo padrão de `screens/home/useHomeData.ts`. */
export function useNotifications(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['notifications', promoterId],
    queryFn: () => notificationRepository.list(promoterId as string),
    enabled: Boolean(promoterId),
  });
}

export function useMarkNotificationRead(promoterId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationRepository.markAsRead(notificationId),
    onSuccess: (_result, notificationId) => {
      queryClient.setQueryData<AppNotification[]>(['notifications', promoterId], (old) =>
        (old ?? []).map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    },
  });
}
