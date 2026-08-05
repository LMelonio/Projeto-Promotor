import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { historyRepository } from '@/repositories/implementations/HistoryRepository';
import { syncQueue } from '@/services/sync/SyncQueue';

/**
 * Hook de dados do Histórico (Fase 4) — mesmo padrão de
 * `screens/home/useHomeData.ts`. O selo "Na fila" por visita (ver
 * `docs/DECISIONS.md`, item 25) é calculado aqui, não no repositório: ele
 * depende da fila de sincronização (`services/sync`), uma camada à parte dos
 * dados de negócio — mesma separação já usada em `useSyncStatus`. Sem efeito
 * em web (fila depende de `expo-sqlite`, sempre reporta tudo sincronizado).
 */
export function useVisitHistory(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['history', promoterId],
    queryFn: async () => {
      const entries = await historyRepository.listCompletedVisits(promoterId as string);
      if (Platform.OS === 'web') return entries;

      const pendingVisitIds = await syncQueue.pendingVisitIds();
      return entries.map((entry) =>
        pendingVisitIds.has(entry.visitId) ? { ...entry, synced: false } : entry,
      );
    },
    enabled: Boolean(promoterId),
  });
}
