import type * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DATABASE_NAME = 'lynkz-promotor-sync.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Banco SQLite local usado só para a fila de sincronização offline (Fase 4)
 * — nenhum outro dado de negócio é cacheado aqui, esse é papel do React
 * Query (ver `docs/ARCHITECTURE.md`, "Gerenciamento de estado"). Instância
 * única por processo, aberta sob demanda.
 *
 * `expo-sqlite` chama `requireNativeModule('ExpoSQLite')` no escopo do
 * módulo (não dentro de uma função) — um `import` estático quebraria a
 * carga do bundle inteiro em web, plataforma sem binding nativo. Por isso o
 * import é dinâmico e só acontece se algo realmente chamar `getDatabase()`;
 * os chamadores (`useAutoSync`, `useSyncStatus`) já checam `Platform.OS` antes
 * disso, então em web esta função nunca deveria ser invocada — o guard
 * abaixo é só uma segunda linha de defesa.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === 'web') {
    return Promise.reject(new Error('SQLite não está disponível na plataforma web.'));
  }

  if (!databasePromise) {
    databasePromise = import('expo-sqlite').then(async (SQLiteModule) => {
      const db = await SQLiteModule.openDatabaseAsync(DATABASE_NAME);
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
