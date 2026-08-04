import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { flushQueue } from '@/services/sync/syncEngine';

/**
 * Dispara a fila de sincronização offline (Fase 4) sempre que a conexão
 * volta, além de uma tentativa ao abrir o app — mesmo padrão de
 * `refetchOnReconnect` já usado no React Query (`AppProviders`), mas para as
 * escritas enfileiradas em SQLite, que o React Query não sabe gerenciar.
 * Montado uma única vez, no topo do app (`AppProviders`).
 *
 * Sem efeito em web: a fila depende de `expo-sqlite`, que não tem binding
 * nativo nessa plataforma (ver `database/local/db.ts`).
 */
export function useAutoSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let previouslyConnected: boolean | null = null;

    async function trySync() {
      const { synced } = await flushQueue();
      if (synced > 0) {
        // Dados que a fila acabou de gravar no servidor podem divergir do
        // que as telas têm em cache local otimista — refaz tudo.
        queryClient.invalidateQueries();
      }
    }

    trySync();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
      if (isConnected && previouslyConnected === false) {
        trySync();
      }
      previouslyConnected = isConnected;
    });

    return unsubscribe;
  }, [queryClient]);
}
