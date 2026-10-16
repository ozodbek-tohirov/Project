import { calculateTotal, isCustomSupplier, suppliers, type Supplier } from './pricing';

export const STORAGE_KEY = 'tamincompare:v1';
export type Receipt = { id: string; createdAt: string; supplierId: string; supplier: Supplier; quantity: number; name: string; total: number };
export type SavedDraft = { quantityText: string; supplierId: string | null; name: string };
export type SavedData = { version: 1; customSuppliers: Supplier[]; draft: SavedDraft; history: Receipt[] };
export function emptySavedData(): SavedData { return { version: 1, customSuppliers: [], draft: { quantityText: '1', supplierId: null, name: '' }, history: [] }; }
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
export function isSupplier(value: unknown): value is Supplier {
  if (!object(value)) return false;
  return typeof value.id === 'string' && (/^custom:[a-z0-9-]+$/i.test(value.id) || ['A', 'B', 'C'].includes(value.id)) &&
    typeof value.name === 'string' && value.name.trim().length > 0 &&
    typeof value.unitPrice === 'number' && Number.isSafeInteger(value.unitPrice) && value.unitPrice > 0 &&
    typeof value.deliveryFee === 'number' && Number.isSafeInteger(value.deliveryFee) && value.deliveryFee >= 0 && Number.isSafeInteger(value.unitPrice + value.deliveryFee) &&
    typeof value.days === 'number' && Number.isSafeInteger(value.days) && value.days >= 1;
}
function isReceipt(value: unknown): value is Receipt {
  if (!object(value) || !isSupplier(value.supplier)) return false;
  if (typeof value.id !== 'string' || !value.id || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt)) || value.supplierId !== value.supplier.id || typeof value.name !== 'string' || !value.name.trim() || typeof value.quantity !== 'number') return false;
  try { return calculateTotal(value.supplier, value.quantity) === value.total; } catch { return false; }
}
export function decodeSavedData(raw: string | null): { data: SavedData; warning: string | null } {
  const empty = emptySavedData();
  if (raw === null) return { data: empty, warning: null };
  const warning = 'Saqlangan ma’lumotlarning bir qismini tiklab bo‘lmadi. Hisob-kitobni davom ettirishingiz mumkin.';
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1 || !Array.isArray(value.customSuppliers) || !Array.isArray(value.history) || !object(value.draft)) return { data: empty, warning };
    const customSuppliers: Supplier[] = [];
    const ids = new Set<string>();
    for (const supplier of value.customSuppliers) {
      if (isSupplier(supplier) && isCustomSupplier(supplier) && !ids.has(supplier.id)) { customSuppliers.push({ id: supplier.id, name: supplier.name, unitPrice: supplier.unitPrice, deliveryFee: supplier.deliveryFee, days: supplier.days }); ids.add(supplier.id); }
    }
    const receiptIds = new Set<string>();
    const history = value.history.filter((entry): entry is Receipt => {
      if (!isReceipt(entry) || receiptIds.has(entry.id)) return false;
      receiptIds.add(entry.id); return true;
    });
    const available = [...suppliers, ...customSuppliers];
    const selectedId = value.draft.supplierId;
    const supplierId = typeof selectedId === 'string' && available.some(supplier => supplier.id === selectedId) ? selectedId : null;
    const draft = { quantityText: typeof value.draft.quantityText === 'string' ? value.draft.quantityText : '1', supplierId, name: typeof value.draft.name === 'string' ? value.draft.name : '' };
    const recovered = customSuppliers.length !== value.customSuppliers.length || history.length !== value.history.length || (selectedId !== null && supplierId === null) || typeof value.draft.quantityText !== 'string' || typeof value.draft.name !== 'string';
    return { data: { version: 1, customSuppliers, draft, history }, warning: recovered ? warning : null };
  } catch { return { data: empty, warning }; }
}
