import type { Scalar } from '@op-engineering/op-sqlite';
import type { AppSettings, Batch, Product } from '../../types/models';

type Row = Record<string, Scalar>;

export function mapProduct(row: Row): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    barcode: row.barcode == null ? null : String(row.barcode),
    category: row.category == null ? null : String(row.category),
    minStock: Number(row.min_stock),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    dirty: Number(row.dirty),
    deletedAt: row.deleted_at == null ? null : String(row.deleted_at),
  };
}

export function mapBatch(row: Row): Batch {
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    batchNumber: String(row.batch_number),
    quantity: Number(row.quantity),
    productionDate: row.production_date == null ? null : String(row.production_date),
    expiryDate: String(row.expiry_date),
    purchasePrice: row.purchase_price == null ? null : Number(row.purchase_price),
    sellingPrice: row.selling_price == null ? null : Number(row.selling_price),
    supplier: row.supplier == null ? null : String(row.supplier),
    notes: row.notes == null ? null : String(row.notes),
    isSold: Number(row.is_sold),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    dirty: Number(row.dirty),
    deletedAt: row.deleted_at == null ? null : String(row.deleted_at),
  };
}

export function mapSettings(row: Row): AppSettings {
  return {
    id: Number(row.id),
    installHash: row.install_hash == null ? null : String(row.install_hash),
    installSalt: row.install_salt == null ? null : String(row.install_salt),
    patternHash: row.pattern_hash == null ? null : String(row.pattern_hash),
    patternSalt: row.pattern_salt == null ? null : String(row.pattern_salt),
    licenseKeyHash: row.license_key_hash == null ? null : String(row.license_key_hash),
    licenseExpiry: row.license_expiry == null ? null : String(row.license_expiry),
    licenseSignature: row.license_signature == null ? null : String(row.license_signature),
    trialStart: row.trial_start == null ? null : String(row.trial_start),
    isLicenseActive: Number(row.is_license_active),
    deviceFingerprint: row.device_fingerprint == null ? null : String(row.device_fingerprint),
    failedAttempts: Number(row.failed_attempts),
    lockedUntil: row.locked_until == null ? null : String(row.locked_until),
    lastUpdated: row.last_updated == null ? null : String(row.last_updated),
  };
}
