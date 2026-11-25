/** المخزون الكلي للمنتج = مجموع كميات تشغيلاته غير المحذوفة وغير المباعة. */
export function computeStock(quantities: number[]): number {
  return quantities.reduce((sum, q) => sum + (Number.isFinite(q) ? q : 0), 0);
}

export function isLowStock(total: number, minStock: number): boolean {
  return total < minStock;
}
