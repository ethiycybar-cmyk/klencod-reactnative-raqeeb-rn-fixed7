import { getDB } from '../db/client';
import { mapProduct } from '../db/mappers';
import { classifyExpiry, daysUntilExpiry } from '../../domain/expiry';
import { computeStock, isLowStock } from '../../domain/stock';
import type { Product, ProductDraft, ProductSummary } from '../../types/models';
import { enqueue } from './syncRepo';

type Row = Record<string, any>;

const SUMMARY_QUERY = `
  SELECT p.*,
    COALESCE(SUM(CASE WHEN b.deleted_at IS NULL AND b.is_sold = 0 THEN b.quantity ELSE 0 END), 0) AS total_quantity,
    COUNT(CASE WHEN b.deleted_at IS NULL THEN 1 END) AS batch_count,
    MIN(CASE WHEN b.deleted_at IS NULL AND b.is_sold = 0 THEN b.expiry_date END) AS nearest_expiry
  FROM products p
  LEFT JOIN batches b ON b.product_id = p.id
  WHERE p.deleted_at IS NULL
`;

function toSummary(row: Row): ProductSummary {
  const product = mapProduct(row);
  const totalQuantity = computeStock([Number(row.total_quantity ?? 0)]);
  const nearest = row.nearest_expiry == null ? null : String(row.nearest_expiry);
  const daysLeft = nearest ? daysUntilExpiry(nearest) : null;
  return {
    ...product,
    totalQuantity,
    batchCount: Number(row.batch_count ?? 0),
    nearestExpiry: nearest,
    daysLeft,
    status: daysLeft == null ? 'good' : classifyExpiry(daysLeft),
  };
}

export function listProducts(query = ''): ProductSummary[] {
  const q = query.trim();
  let sql = SUMMARY_QUERY;
  const params: (string | number)[] = [];
  if (q) {
    sql += ' AND (p.name LIKE ? OR p.barcode LIKE ? OR p.category LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' GROUP BY p.id ORDER BY p.name COLLATE NOCASE ASC';
  return getDB().executeSync(sql, params).rows.map((row) => toSummary(row as Row));
}

export function getProduct(id: number): Product | null {
  const rows = getDB().executeSync('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL', [id]).rows;
  return rows.length ? mapProduct(rows[0]) : null;
}

export function getProductSummary(id: number): ProductSummary | null {
  const rows = getDB()
    .executeSync(`${SUMMARY_QUERY} AND p.id = ? GROUP BY p.id`, [id])
    .rows;
  return rows.length ? toSummary(rows[0] as Row) : null;
}

export function barcodeExists(barcode: string, excludeId?: number): boolean {
  if (!barcode.trim()) return false;
  const rows = getDB()
    .executeSync('SELECT id FROM products WHERE barcode = ? AND deleted_at IS NULL AND id != ?', [
      barcode.trim(),
      excludeId ?? -1,
    ]).rows;
  return rows.length > 0;
}

export function createProduct(draft: ProductDraft): number {
  const db = getDB();
  const now = new Date().toISOString();
  const result = db.executeSync(
    'INSERT INTO products (name, barcode, category, min_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      draft.name.trim(),
      draft.barcode.trim() || null,
      draft.category.trim() || null,
      Number(draft.minStock) || 0,
      now,
      now,
    ],
  );
  const id = Number(result.insertId ?? 0);
  enqueue('products', id, 'create', { id, name: draft.name });
  return id;
}

export function updateProduct(id: number, draft: ProductDraft): void {
  const now = new Date().toISOString();
  getDB().executeSync(
    'UPDATE products SET name = ?, barcode = ?, category = ?, min_stock = ?, updated_at = ?, dirty = 1 WHERE id = ?',
    [
      draft.name.trim(),
      draft.barcode.trim() || null,
      draft.category.trim() || null,
      Number(draft.minStock) || 0,
      now,
      id,
    ],
  );
  enqueue('products', id, 'update', { id, name: draft.name });
}

/** حذف ناعم للمنتج وتشغيلاته في معاملة واحدة. */
export async function deleteProduct(id: number): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.transaction(async (tx) => {
    await tx.execute('UPDATE products SET deleted_at = ?, dirty = 1, updated_at = ? WHERE id = ?', [now, now, id]);
    await tx.execute('UPDATE batches SET deleted_at = ?, dirty = 1, updated_at = ? WHERE product_id = ? AND deleted_at IS NULL', [now, now, id]);
    await tx.execute('INSERT INTO sync_queue (table_name, record_id, action, payload) VALUES (?, ?, ?, ?)', [
      'products', id, 'delete', JSON.stringify({ id }),
    ]);
  });
}

export function lowStockProducts(): ProductSummary[] {
  return listProducts().filter((p) => isLowStock(p.totalQuantity, p.minStock));
}
