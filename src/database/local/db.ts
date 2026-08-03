import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'lynkz-promotor-sync.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Banco SQLite local usado só para a fila de sincronização offline (Fase 4)
 * — nenhum outro dado de negócio é cacheado aqui, esse é papel do React
 * Query (ver `docs/ARCHITECTURE.md`, "Gerenciamento de estado"). Instância
 * única por processo, aberta sob demanda.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY NOT NULL,
          kind TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT
        );
      `);
      return db;
    });
  }
  return databasePromise;
}
