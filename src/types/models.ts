/** الحالات الصحية للتشغيلة/المنتج حسب القرب من انتهاء الصلاحية. */
export type StatusLevel = 'good' | 'warning' | 'critical' | 'expired';

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  category: string | null;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  dirty: number;
  deletedAt: string | null;
}

export interface Batch {
  id: number;
  productId: number;
  batchNumber: string;
  quantity: number;
  productionDate: string | null;
  expiryDate: string;
  purchasePrice: number | null;
  sellingPrice: number | null;
  supplier: string | null;
  notes: string | null;
  isSold: number;
  createdAt: string;
  updatedAt: string;
  dirty: number;
  deletedAt: string | null;
}

export interface AppSettings {
  id: number;
  installHash: string | null;
  installSalt: string | null;
  patternHash: string | null;
  patternSalt: string | null;
  licenseKeyHash: string | null;
  licenseExpiry: string | null;
  licenseSignature: string | null;
  trialStart: string | null;
  isLicenseActive: number;
  deviceFingerprint: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
  lastUpdated: string | null;
}

export interface ProductSummary extends Product {
  totalQuantity: number;
  batchCount: number;
  nearestExpiry: string | null;
  status: StatusLevel;
  daysLeft: number | null;
}

export interface BatchWithProduct extends Batch {
  productName: string;
  status: StatusLevel;
  daysLeft: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalBatches: number;
  lowStock: number;
  expiringSoon: number;
  expiredCount: number;
  criticalCount: number;
}

export type ProductDraft = {
  name: string;
  barcode: string;
  category: string;
  minStock: string;
};

export type BatchDraft = {
  productId: number;
  batchNumber: string;
  quantity: string;
  productionDate: string;
  expiryDate: string;
  purchasePrice: string;
  sellingPrice: string;
  supplier: string;
  notes: string;
};

export const CATEGORIES = [
  'أدوية',
  'مستلزمات طبية',
  'مكمّلات غذائية',
  'منتجات عناية',
  'أجهزة طبية',
  'مواد مختبرية',
  'أخرى',
] as const;
