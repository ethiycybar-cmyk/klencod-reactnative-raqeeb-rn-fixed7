import { getDB, exportSnapshot } from '../data/db/client';
import { isISODate } from '../utils/dates';
import type { Batch, Product } from '../types/models';

type Backup = {
  app: 'raqeeb';
  version: number;
  exportedAt: string;
  products: Product[];
  batches: Batch[];
};

const toProduct = (row: Record<string, unknown>): Product => ({
  id: Number(row.id),
  name: String(row.name ?? ''),
  barcode: row.barcode == null ? null : String(row.barcode),
  category: row.category == null ? null : String(row.category),
  minStock: Number(row.min_stock ?? 10),
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
  dirty: Number(row.dirty ?? 1),
  deletedAt: row.deleted_at == null ? null : String(row.deleted_at),
});

const toBatch = (row: Record<string, unknown>): Batch => ({
  id: Number(row.id),
  productId: Number(row.product_id),
  batchNumber: String(row.batch_number ?? ''),
  quantity: Number(row.quantity ?? 0),
  productionDate: row.production_date == null ? null : String(row.production_date),
  expiryDate: String(row.expiry_date ?? ''),
  purchasePrice: row.purchase_price == null ? null : Number(row.purchase_price),
  sellingPrice: row.selling_price == null ? null : Number(row.selling_price),
  supplier: row.supplier == null ? null : String(row.supplier),
  notes: row.notes == null ? null : String(row.notes),
  isSold: Number(row.is_sold ?? 0),
  createdAt: String(row.created_at ?? ''),
  updatedAt: String(row.updated_at ?? ''),
  dirty: Number(row.dirty ?? 1),
  deletedAt: row.deleted_at == null ? null : String(row.deleted_at),
});

export function buildBackup(): string {
  const snapshot = exportSnapshot();
  const backup: Backup = {
    app: 'raqeeb',
    version: 1,
    exportedAt: snapshot.exportedAt,
    products: snapshot.products.map((row) => toProduct(row as Record<string, unknown>)),
    batches: snapshot.batches.map((row) => toBatch(row as Record<string, unknown>)),
  };
  return JSON.stringify(backup, null, 2);
}

export type ImportResult = { ok: boolean; products: number; batches: number; message: string };

/** استيراد احتياطي بعد التحقق من البنية، داخل معاملة واحدة. */
export async function importBackup(text: string): Promise<ImportResult> {
  let parsed: Partial<Backup>;
  try {
    parsed = JSON.parse(text) as Partial<Backup>;
  } catch {
    return { ok: false, products: 0, batches: 0, message: 'الملف ليس JSON صالحاً' };
  }
  if (parsed.app !== 'raqeeb' || !Array.isArray(parsed.products) || !Array.isArray(parsed.batches)) {
    return { ok: false, products: 0, batches: 0, message: 'صيغة النسخة الاحتياطية غير صحيحة' };
  }
  if (parsed.batches.some((b) => !isISODate(b.expiryDate))) {
    return { ok: false, products: 0, batches: 0, message: 'توجد تواريخ انتهاء غير صالحة في الملف' };
  }

  const db = getDB();
  await db.transaction(async (tx) => {
    await tx.execute('DELETE FROM sync_queue');
    await tx.execute('DELETE FROM batches');
    await tx.execute('DELETE FROM products');
    for (const p of parsed.products ?? []) {
      await tx.execute(
        `INSERT INTO products (id, name, barcode, category, min_stock, created_at, updated_at, dirty, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.barcode, p.category, p.minStock, p.createdAt, p.updatedAt, 1, p.deletedAt],
      );
    }
    for (const b of parsed.batches ?? []) {
      await tx.execute(
        `INSERT INTO batches (id, product_id, batch_number, quantity, production_date, expiry_date,
          purchase_price, selling_price, supplier, notes, is_sold, created_at, updated_at, dirty, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.productId, b.batchNumber, b.quantity, b.productionDate, b.expiryDate, b.purchasePrice,
          b.sellingPrice, b.supplier, b.notes, b.isSold, b.createdAt, b.updatedAt, 1, b.deletedAt],
      );
    }
  });
  return {
    ok: true,
    products: parsed.products.length,
    batches: parsed.batches.length,
    message: `تم استيراد ${parsed.products.length} منتجاً و${parsed.batches.length} تشغيلة`,
  };
}
