import { getDB } from '../db/client';

export type SyncAction = 'create' | 'update' | 'delete';

export function enqueue(table: 'products' | 'batches', recordId: number, action: SyncAction, payload: unknown): void {
  getDB().executeSync('INSERT INTO sync_queue (table_name, record_id, action, payload) VALUES (?, ?, ?, ?)', [
    table,
    recordId,
    action,
    JSON.stringify(payload),
  ]);
}

export function pendingCount(): number {
  return Number(
    getDB().executeSync('SELECT COUNT(*) AS c FROM sync_queue WHERE synced = 0').rows[0]?.c ?? 0,
  );
}

export function markSynced(ids: number[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  getDB().executeSync(`UPDATE sync_queue SET synced = 1 WHERE id IN (${placeholders})`, ids);
}
