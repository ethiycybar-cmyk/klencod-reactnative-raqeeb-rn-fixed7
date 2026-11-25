import type { StatusLevel } from '../types/models';

/** عدد الأيام الكاملة بين تاريخ اليوم وتاريخ الانتهاء (سالب = منتهٍ). */
export function daysUntilExpiry(expiryDate: string, now: Date = new Date()): number {
  const [y, m, d] = expiryDate.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const expiry = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((expiry - today) / 86_400_000);
}

/** good > 90 · warning 31–90 · critical 0–30 · expired < 0 */
export function classifyExpiry(days: number): StatusLevel {
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'good';
}

export function statusForDate(expiryDate: string, now: Date = new Date()): StatusLevel {
  return classifyExpiry(daysUntilExpiry(expiryDate, now));
}

export const STATUS_LABEL: Record<StatusLevel, string> = {
  good: 'جيد',
  warning: 'قريب الانتهاء',
  critical: 'حرج',
  expired: 'منتهي',
};

/** ترتيب التشغيلات: الأقرب للانتهاء أولاً (يُستخدم في SQL و JS). */
export function byExpiryAsc<T extends { expiryDate: string }>(a: T, b: T): number {
  return a.expiryDate.localeCompare(b.expiryDate);
}
