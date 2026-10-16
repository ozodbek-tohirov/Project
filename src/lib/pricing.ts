export const suppliers = [
  { id: 'A', name: 'A ta’minotchi', unitPrice: 40_000, deliveryFee: 20_000, days: 1 },
  { id: 'B', name: 'B ta’minotchi', unitPrice: 38_000, deliveryFee: 35_000, days: 2 },
  { id: 'C', name: 'C ta’minotchi', unitPrice: 42_000, deliveryFee: 0, days: 3 },
] as const;
export type Supplier = (typeof suppliers)[number];
export type SupplierId = Supplier['id'];
export const MAX_QUANTITY = Math.floor((Number.MAX_SAFE_INTEGER - 35_000) / 42_000);
export function parseQuantity(text: string): number | null {
  if (!/^[0-9]+$/.test(text)) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_QUANTITY ? value : null;
}
export function calculateTotal(supplier: Supplier, quantity: number): number {
  const total = quantity * supplier.unitPrice + supplier.deliveryFee;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(total)) throw new RangeError('Invalid quantity');
  return total;
}
export function cheapestIds(quantity: number, offers: readonly Supplier[] = suppliers): SupplierId[] {
  const minimum = Math.min(...offers.map(supplier => calculateTotal(supplier, quantity)));
  return offers.filter(supplier => calculateTotal(supplier, quantity) === minimum).map(supplier => supplier.id);
}
export function formatMoney(value: number): string {
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).formatToParts(value).map(part => part.type === 'group' ? ' ' : part.value).join('') + ' so‘m';
}
export function validName(value: string): boolean { return value.trim().length > 0; }

