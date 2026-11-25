import { open, type DB, type SQLBatchTuple } from '@op-engineering/op-sqlite';
import { MIGRATIONS } from './migrations';

let connection: DB | null = null;

export function getDB(): DB {
  if (!connection) {
    connection = open({ name: 'raqeeb.db' });
    connection.executeSync('PRAGMA foreign_keys = ON');
  }
  return connection;
}

/** يُستدعى مرة واحدة عند الإقلاع قبل أي وصول للبيانات. */
export async function initDatabase(): Promise<void> {
  const db = getDB();
  db.executeSync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)',
  );
  const appliedRows = db.executeSync('SELECT version FROM schema_migrations').rows;
  const applied = new Set(appliedRows.map((row) => Number(row.version)));

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    await db.executeBatch(migration.statements.map((sql) => [sql] as SQLBatchTuple));
    db.executeSync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [
      migration.version,
      new Date().toISOString(),
    ]);
  }
}

/** نسخة احتياطية كاملة تُستخدم في شاشة الإعدادات. */
export function exportSnapshot(): { products: unknown[]; batches: unknown[]; exportedAt: string } {
  const db = getDB();
  return {
    products: db.executeSync('SELECT * FROM products').rows,
    batches: db.executeSync('SELECT * FROM batches').rows,
    exportedAt: new Date().toISOString(),
  };
}
