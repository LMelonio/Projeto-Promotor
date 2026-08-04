import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { syncQueue } from './SyncQueue';
import { flushQueue } from './syncEngine';

/**
 * Status da fila de sincronização offline (Fase 4) para exibição no Perfil —
 * quantos itens aguardam conexão e um disparo manual de "Sincronizar agora"
 * (além do automático já feito por `useAutoSync` ao reconectar).
 *
 * Sem efeito em web: a fila depende de `expo-sqlite`, que não tem binding
 * nativo nessa plataforma (ver `database/local/db.ts`) — sempre reporta 0.
 */
export function useSyncStatus() {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPendingCount(0);
      return;
    }
    setPendingCount(await syncQueue.count());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { synced } = await flushQueue();
      if (synced > 0) {
        queryClient.invalidateQueries();
      }
    } finally {
      await refresh();
      setIsSyncing(false);
    }
  }, [queryClient, refresh]);

  return { pendingCount, isSyncing, syncNow, refresh };
}
