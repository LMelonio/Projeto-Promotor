import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/database/local/db';

export type SyncKind =
  'check_in' | 'check_out' | 'register_activity' | 'submit_questionnaire' | 'register_ruptura';

export interface QueuedItem {
  id: string;
  kind: SyncKind;
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError: string | null;
}

interface QueuedItemRow {
  id: string;
  kind: SyncKind;
  payload: string;
  created_at: string;
  attempts: number;
  last_error: string | null;
}

/**
 * Fila de sincronização offline (Fase 4): persiste, em SQLite local, ações
 * que falharam por causa da rede em campo — check-in/check-out, Atividade,
 * Questionário, Ruptura — para reenviar quando a conexão voltar. Ver
 * `docs/DECISIONS.md`, item 14, para o raciocínio completo.
 */
class SyncQueue {
  async enqueue(kind: SyncKind, payload: unknown): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO sync_queue (id, kind, payload, created_at, attempts, last_error) VALUES (?, ?, ?, ?, 0, NULL)',
      [Crypto.randomUUID(), kind, JSON.stringify(payload), new Date().toISOString()],
    );
  }

  async listPending(): Promise<QueuedItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<QueuedItemRow>(
      'SELECT * FROM sync_queue ORDER BY created_at ASC',
    );

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
      attempts: row.attempts,
      lastError: row.last_error,
    }));
  }

  /**
   * IDs de visita com pelo menos uma escrita ainda não sincronizada — usado
   * pelo Histórico para o selo "Na fila" por visita (ver `docs/DECISIONS.md`,
   * item 25). `register_ruptura` não carrega `visitId` no payload (só
   * `clientId`, mesma limitação já registrada no item 14), então uma ruptura
   * enfileirada não derruba o selo de sincronizada da visita.
   */
  async pendingVisitIds(): Promise<Set<string>> {
    const items = await this.listPending();
    const ids = new Set<string>();
    for (const item of items) {
      const visitId = (item.payload as { visitId?: string }).visitId;
      if (visitId) ids.add(visitId);
    }
    return ids;
  }

  async count(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) as total FROM sync_queue',
    );
    return row?.total ?? 0;
  }

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  async recordFailure(id: string, error: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
      [error, id],
    );
  }
}

export const syncQueue = new SyncQueue();
