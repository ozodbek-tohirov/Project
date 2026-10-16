import { createContext, useContext, useState, type ReactNode } from 'react';
import { useEffect } from 'react';
import { calculateTotal, isCustomSupplier, parseQuantity, suppliers, validName, type Supplier, type SupplierId } from '@/lib/pricing';
import { decodeSavedData, emptySavedData, isSupplier, STORAGE_KEY, type Receipt, type SavedData } from '@/lib/storage';
type State = SavedData & { receipt: Receipt | null };
type RequestContext = State['draft'] & {
  receipt: Receipt | null; offers: readonly Supplier[]; history: Receipt[]; storageWarning: string | null;
  setQuantity: (value: string) => void; setSupplier: (value: SupplierId) => void;
  setName: (value: string) => void; submit: () => void; resetDraft: () => void;
  saveSupplier: (value: Omit<Supplier, 'id'>, id?: string) => void;
  deleteSupplier: (id: string) => void; deleteReceipt: (id: string) => void; reuseReceipt: (id: string) => void;
};
const Context = createContext<RequestContext | null>(null);
function load() {
  try { return decodeSavedData(window.localStorage.getItem(STORAGE_KEY)); }
  catch { return { data: emptySavedData(), warning: 'Brauzer xotirasidan foydalanib bo‘lmadi. Ma’lumotlar faqat ushbu sahifa ochiq turganida saqlanadi.' }; }
}
export function RequestProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [state, setState] = useState<State>(() => ({ ...initial.data, receipt: null }));
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const offers = [...suppliers, ...state.customSuppliers];
  useEffect(() => {
    try {
      const { version, customSuppliers, draft, history } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version, customSuppliers, draft, history }));
    } catch { setStorageWarning('Ma’lumotlarni brauzer xotirasiga saqlab bo‘lmadi. Sahifani yopish yoki yangilashda so‘nggi o‘zgarishlar yo‘qolishi mumkin.'); }
  }, [state]);
  function submit() {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    setState(current => {
      if (current.receipt) return current;
      const available = [...suppliers, ...current.customSuppliers];
      const quantity = parseQuantity(current.draft.quantityText, available);
      const supplier = available.find(item => item.id === current.draft.supplierId);
      if (quantity === null || !supplier || !validName(current.draft.name)) return current;
      const receipt: Receipt = { id, createdAt, supplierId: supplier.id, supplier: { ...supplier }, quantity, name: current.draft.name.trim(), total: calculateTotal(supplier, quantity) };
      return { ...current, receipt, history: [receipt, ...current.history] };
    });
  }
  function saveSupplier(value: Omit<Supplier, 'id'>, id?: string) {
    const supplier = { ...value, name: value.name.trim(), id: id ?? 'custom:' + crypto.randomUUID() };
    if (!isSupplier(supplier) || !isCustomSupplier(supplier)) return;
    setState(current => ({ ...current, receipt: null, customSuppliers: id ? current.customSuppliers.map(item => item.id === id ? supplier : item) : [...current.customSuppliers, supplier] }));
  }
  function deleteSupplier(id: string) {
    if (!id.startsWith('custom:')) return;
    setState(current => ({ ...current, receipt: null, customSuppliers: current.customSuppliers.filter(item => item.id !== id), draft: { ...current.draft, supplierId: current.draft.supplierId === id ? null : current.draft.supplierId } }));
  }
  function reuseReceipt(id: string) {
    setState(current => {
      const saved = current.history.find(item => item.id === id);
      if (!saved) return current;
      const missing = ![...suppliers, ...current.customSuppliers].some(item => item.id === saved.supplierId);
      return { ...current, receipt: null, customSuppliers: missing && isCustomSupplier(saved.supplier) ? [...current.customSuppliers, { ...saved.supplier }] : current.customSuppliers, draft: { quantityText: String(saved.quantity), supplierId: saved.supplierId, name: saved.name } };
    });
  }
  return <Context.Provider value={{ ...state.draft, receipt: state.receipt, offers, history: state.history, storageWarning,
    setQuantity: value => setState(current => ({ ...current, draft: { ...current.draft, quantityText: value }, receipt: null })),
    setSupplier: value => setState(current => ({ ...current, draft: { ...current.draft, supplierId: value }, receipt: null })),
    setName: value => setState(current => ({ ...current, draft: { ...current.draft, name: value }, receipt: null })),
    resetDraft: () => setState(current => ({ ...current, draft: emptySavedData().draft, receipt: null })),
    deleteReceipt: id => setState(current => ({ ...current, history: current.history.filter(item => item.id !== id) })),
    submit, saveSupplier, deleteSupplier, reuseReceipt,
  }}>{children}</Context.Provider>;
}
export function useRequest() {
  const context = useContext(Context);
  if (!context) throw new Error('RequestProvider is required');
  return context;
}

