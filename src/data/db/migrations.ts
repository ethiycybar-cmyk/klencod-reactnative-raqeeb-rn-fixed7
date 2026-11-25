export type Migration = { version: number; statements: string[] };

/** ترحيلات مرقّمة؛ لا تُعدَّل بعد نشر الإصدار، أضف ترحيلاً جديداً بدلاً من ذلك. */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        install_hash TEXT,
        install_salt TEXT,
        pattern_hash TEXT,
        pattern_salt TEXT,
        license_key_hash TEXT,
        license_expiry TEXT,
        license_signature TEXT,
        trial_start TEXT,
        is_license_active INTEGER DEFAULT 0,
        device_fingerprint TEXT,
        failed_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        last_updated TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        barcode TEXT UNIQUE,
        category TEXT,
        min_stock INTEGER NOT NULL DEFAULT 10,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        dirty INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        batch_number TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        production_date TEXT,
        expiry_date TEXT NOT NULL,
        purchase_price REAL,
        selling_price REAL,
        supplier TEXT,
        notes TEXT,
        is_sold INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        dirty INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches(expiry_date)`,
      `CREATE INDEX IF NOT EXISTS idx_batches_product ON batches(product_id)`,
      `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`,
      `CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id INTEGER NOT NULL,
        action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        attempts INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ],
  },
];
