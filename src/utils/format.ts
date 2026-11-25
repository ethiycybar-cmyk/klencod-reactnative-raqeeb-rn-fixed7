export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${formatNumber(value)} ر.س`;
}

export function pluralDays(days: number): string {
  if (days === 0) return 'اليوم';
  if (days === 1) return 'يوم واحد';
  if (days === 2) return 'يومان';
  if (days < 11) return `${days} أيام`;
  return `${days} يوماً`;
}
