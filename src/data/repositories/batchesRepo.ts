import { getDB } from '../db/client';
import { mapBatch } from '../db/mappers';
import { classifyExpiry, daysUntilExpiry } from '../../domain/expiry';
import { addDaysISO, todayISO } from '../../utils/dates';
import type { Batch, BatchDraft, BatchWithProduct, DashboardStats, StatusLevel } from '../../types/models';
import { enqueue } from './syncRepo';
import { lowStockProducts } from './productsRepo';

type Row = Record<string, any>;

const BASE_QUERY = `
  SELECT b.*, p.name AS product_name
  FROM batches b
  JOIN products p ON p.id = b.product_id
  WHERE b.deleted_at IS NULL AND p.deleted_at IS NULL
`;

function toBatchWithProduct(row: Row): BatchWithProduct {
  const batch = mapBatch(row);
  const daysLeft = daysUntilExpiry(batch.expiryDate);
  return {
    ...batch,
    productName: String(row.product_name ?? ''),
    daysLeft,
    status: classifyExpiry(daysLeft),
  };
}

export function listBatches(query = '', filter: StatusLevel | 'all' = 'all'): BatchWithProduct[] {
  const q = query.trim();
  let sql = BASE_QUERY;
  const params: (string | number)[] = [];
  if (q) {
    sql += ' AND (p.name LIKE ? OR b.batch_number LIKE ? OR b.supplier LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY b.expiry_date ASC';
  let rows = getDB().executeSync(sql, params).rows.map((row) => toBatchWithProduct(row as Row));
  if (filter !== 'all') rows = rows.filter((batch) => batch.status === filter);
  return rows;
}

export function listBatchesForProduct(productId: number): BatchWithProduct[] {
  const rows = getDB()
    .executeSync(`${BASE_QUERY} AND b.product_id = ? ORDER BY b.expiry_date ASC`, [productId])
    .rows;
  return rows.map((row) => toBatchWithProduct(row as Row));
}

export function getBatch(id: number): Batch | null {
  const rows = getDB().executeSync('SELECT * FROM batches WHERE id = ? AND deleted_at IS NULL', [id]).rows;
  return rows.length ? mapBatch(rows[0]) : null;
}

export function createBatch(draft: BatchDraft): number {
  const db = getDB();
  const now = new Date().toISOString();
  const result = db.executeSync(
    `INSERT INTO batches
      (product_id, batch_number, quantity, production_date, expiry_date, purchase_price, selling_price, supplier, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      draft.productId,
      draft.batchNumber.trim(),
      Number(draft.quantity) || 0,
      draft.productionDate.trim() || null,
      draft.expiryDate,
      draft.purchasePrice ? Number(draft.purchasePrice) : null,
      draft.sellingPrice ? Number(draft.sellingPrice) : null,
      draft.supplier.trim() || null,
      draft.notes.trim() || null,
      now,
      now,
    ],
  );
  const id = Number(result.insertId ?? 0);
  enqueue('batches', id, 'create', { id, productId: draft.productId });
  return id;
}

export function updateBatch(id: number, draft: BatchDraft): void {
  getDB().executeSync(
    `UPDATE batches SET
      product_id = ?, batch_number = ?, quantity = ?, production_date = ?, expiry_date = ?,
      purchase_price = ?, selling_price = ?, supplier = ?, notes = ?, updated_at = ?, dirty = 1
     WHERE id = ?`,
    [
      draft.productId,
      draft.batchNumber.trim(),
      Number(draft.quantity) || 0,
      draft.productionDate.trim() || null,
      draft.expiryDate,
      draft.purchasePrice ? Number(draft.purchasePrice) : null,
      draft.sellingPrice ? Number(draft.sellingPrice) : null,
      draft.supplier.trim() || null,
      draft.notes.trim() || null,
      new Date().toISOString(),
      id,
    ],
  );
  enqueue('batches', id, 'update', { id, productId: draft.productId });
}

export function deleteBatch(id: number): void {
  const now = new Date().toISOString();
  getDB().executeSync('UPDATE batches SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?', [now, now, id]);
  enqueue('batches', id, 'delete', { id });
}

export function dashboardStats(): DashboardStats {
  const db = getDB();
  const today = todayISO();
  const soon = addDaysISO(90);
  const totalProducts = Number(db.executeSync('SELECT COUNT(*) AS c FROM products WHERE deleted_at IS NULL').rows[0]?.c ?? 0);
  const totalBatches = Number(
    db.executeSync('SELECT COUNT(*) AS c FROM batches WHERE deleted_at IS NULL AND is_sold = 0').rows[0]?.c ?? 0,
  );
  const expiringSoon = Number(
    db.executeSync(
      'SELECT COUNT(*) AS c FROM batches WHERE deleted_at IS NULL AND is_sold = 0 AND expiry_date >= ? AND expiry_date <= ?',
      [today, soon],
    ).rows[0]?.c ?? 0,
  );
  const expiredCount = Number(
    db.executeSync(
      'SELECT COUNT(*) AS c FROM batches WHERE deleted_at IS NULL AND is_sold = 0 AND expiry_date < ?',
      [today],
    ).rows[0]?.c ?? 0,
  );
  return {
    totalProducts,
    totalBatches,
    lowStock: lowStockProducts().length,
    expiringSoon,
    expiredCount,
    criticalCount: expiringSoon + expiredCount,
  };
}

/** العناصر المنتهية + القريبة من الانتهاء خلال 90 يوماً، مرتّبة حسب القرب. */
export function attentionBatches(limit = 10): BatchWithProduct[] {
  const soon = addDaysISO(90);
  const rows = getDB()
    .executeSync(
      `${BASE_QUERY} AND b.is_sold = 0 AND b.expiry_date <= ? ORDER BY b.expiry_date ASC LIMIT ?`,
      [soon, limit],
    )
    .rows;
  return rows.map((row) => toBatchWithProduct(row as Row));
}
