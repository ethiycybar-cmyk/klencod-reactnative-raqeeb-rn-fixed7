import { classifyExpiry, daysUntilExpiry } from '../src/domain/expiry';
import { addDaysISO, daysBetween, isISODate, todayISO } from '../src/utils/dates';
import { formatLicense, parseLicense, type LicensePayload } from '../src/domain/license';
import { computeStock, isLowStock } from '../src/domain/stock';

describe('تصنيف الصلاحية', () => {
  const now = new Date(2026, 0, 15);

  it('يحسب الأيام بشكل صحيح', () => {
    expect(daysUntilExpiry('2026-01-15', now)).toBe(0);
    expect(daysUntilExpiry('2026-01-16', now)).toBe(1);
    expect(daysUntilExpiry('2026-01-14', now)).toBe(-1);
  });

  it('يصنّف الحالات الأربع', () => {
    expect(classifyExpiry(91)).toBe('good');
    expect(classifyExpiry(90)).toBe('warning');
    expect(classifyExpiry(31)).toBe('warning');
    expect(classifyExpiry(30)).toBe('critical');
    expect(classifyExpiry(0)).toBe('critical');
    expect(classifyExpiry(-1)).toBe('expired');
  });
});

describe('التواريخ', () => {
  it('يتحقق من صيغة ISO', () => {
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2026-13-01')).toBe(false);
    expect(isISODate('28/02/2026')).toBe(false);
  });

  it('يضيف الأيام و يحسب الفرق', () => {
    const start = '2026-01-01';
    expect(addDaysISO(30, new Date(2026, 0, 1))).toBe('2026-01-31');
    expect(daysBetween(start, '2026-02-01')).toBe(31);
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('الترخيص', () => {
  const payload: LicensePayload = { d: 'abc123', e: '2027-01-01', i: 'RQ-001', n: 'عميل تجريبي' };

  it('يُرمّز ويُفكّ الرمز دون فقدان البيانات', () => {
    const license = formatLicense(payload, 'ab'.repeat(64));
    expect(license.startsWith('RAQEB1.')).toBe(true);
    const parsed = parseLicense(license);
    expect(parsed?.payload).toEqual(payload);
    expect(parsed?.signature).toBe('ab'.repeat(64));
  });

  it('يرفض الرمز غير الصالح', () => {
    expect(parseLicense('invalid')).toBeNull();
    expect(parseLicense('RAQEB1.zz')).toBeNull();
  });
});

describe('المخزون', () => {
  it('يجمع الكميات ويقارن بالحد الأدنى', () => {
    expect(computeStock([10, 5, -2])).toBe(13);
    expect(isLowStock(9, 10)).toBe(true);
    expect(isLowStock(10, 10)).toBe(false);
  });
});
