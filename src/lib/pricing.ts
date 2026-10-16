export const suppliers = [
  { id: 'A', name: 'A ta’minotchi', unitPrice: 40_000, deliveryFee: 20_000, days: 1 },
  { id: 'B', name: 'B ta’minotchi', unitPrice: 38_000, deliveryFee: 35_000, days: 2 },
  { id: 'C', name: 'C ta’minotchi', unitPrice: 42_000, deliveryFee: 0, days: 3 },
] as const;
export type SupplierId = string;
export type Supplier = { id: SupplierId; name: string; unitPrice: number; deliveryFee: number; days: number };
export function isCustomSupplier(supplier: Supplier): boolean { return supplier.id.startsWith('custom:'); }
export const MAX_QUANTITY = Math.floor((Number.MAX_SAFE_INTEGER - 35_000) / 42_000);
export function quantityLimit(offers: readonly Supplier[] = suppliers): number {
  return Math.min(MAX_QUANTITY, ...offers.map(offer => Math.floor((Number.MAX_SAFE_INTEGER - offer.deliveryFee) / offer.unitPrice)));
}
export function parseQuantity(text: string, offers: readonly Supplier[] = suppliers): number | null {
  if (!/^[0-9]+$/.test(text)) return null;
  const value = Number(text);
  return Number.isSafeInteger(value) && value >= 1 && value <= quantityLimit(offers) && offers.every(offer => Number.isSafeInteger(value * offer.unitPrice + offer.deliveryFee)) ? value : null;
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

export type SupplierFields = { name: string; unitPrice: string; deliveryFee: string; days: string };
export function validateSupplier(fields: SupplierFields) {
  const errors: Partial<Record<keyof SupplierFields, string>> = {};
  const values = { name: fields.name.trim(), unitPrice: Number(fields.unitPrice), deliveryFee: Number(fields.deliveryFee), days: Number(fields.days) };
  if (!values.name) errors.name = 'Ta’minotchi nomini kiriting.';
  for (const field of ['unitPrice', 'deliveryFee', 'days'] as const) {
    const minimum = field === 'deliveryFee' ? 0 : 1;
    if (!/^[0-9]+$/.test(fields[field]) || !Number.isSafeInteger(values[field]) || values[field] < minimum) {
      errors[field] = field === 'deliveryFee' ? '0 yoki undan katta butun son kiriting.' : 'Kamida 1 bo‘lgan butun son kiriting.';
    }
  }
  if (!errors.unitPrice && !errors.deliveryFee && !Number.isSafeInteger(values.unitPrice + values.deliveryFee)) errors.unitPrice = 'Narx juda katta. Kichikroq qiymat kiriting.';
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

