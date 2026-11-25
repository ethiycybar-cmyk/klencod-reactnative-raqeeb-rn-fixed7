import { getDB } from '../data/db/client';
import { markSynced, pendingCount } from '../data/repositories/syncRepo';
import { LAST_SYNC_KEY, storage } from '../data/storage';

export type SyncReport = {
  ok: boolean;
  synced: number;
  pending: number;
  message: string;
  lastSync: string | null;
};

/**
 * المزامنة اختيارية وتعمل فقط عند ضبط عنوان خادم في الإعدادات.
 * التطبيق يعمل بالكامل دونها (Offline-first).
 */
export async function syncNow(baseUrl?: string): Promise<SyncReport> {
  const pending = pendingCount();
  const lastSync = storage.getString(LAST_SYNC_KEY) ?? null;
  if (!baseUrl) {
    return { ok: false, synced: 0, pending, message: 'لم يتم ضبط خادم المزامنة — البيانات محلية', lastSync };
  }

  try {
    const rows = getDB()
      .executeSync('SELECT id, table_name, record_id, action, payload, attempts FROM sync_queue WHERE synced = 0 ORDER BY id LIMIT 100')
      .rows;
    const ids: number[] = [];
    for (const row of rows) {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/sync/${row.table_name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: row.action,
          recordId: row.record_id,
          payload: JSON.parse(String(row.payload)),
          clientMutationId: row.id,
        }),
      });
      if (response.ok) ids.push(Number(row.id));
    }
    markSynced(ids);
    const now = new Date().toISOString();
    storage.set(LAST_SYNC_KEY, now);
    return {
      ok: true,
      synced: ids.length,
      pending: pendingCount(),
      message: `تمت مزامنة ${ids.length} عنصراً`,
      lastSync: now,
    };
  } catch {
    return { ok: false, synced: 0, pending: pendingCount(), message: 'تعذّر الاتصال بخادم المزامنة', lastSync };
  }
}
