import { createContext, useContext, useState, type ReactNode } from 'react';
import { calculateTotal, parseQuantity, suppliers, validName, type SupplierId } from '@/lib/pricing';
type Receipt = { supplierId: SupplierId; quantity: number; name: string; total: number };
type Draft = { quantityText: string; supplierId: SupplierId | null; name: string; receipt: Receipt | null };
type RequestContext = Draft & {
  setQuantity: (value: string) => void; setSupplier: (value: SupplierId) => void;
  setName: (value: string) => void; submit: () => void;
};
const Context = createContext<RequestContext | null>(null);
export function RequestProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>({ quantityText: '1', supplierId: null, name: '', receipt: null });
  function submit() {
    const quantity = parseQuantity(draft.quantityText);
    const supplier = suppliers.find(item => item.id === draft.supplierId);
    if (quantity === null || !supplier || !validName(draft.name)) return;
    setDraft(current => ({ ...current, receipt: { supplierId: supplier.id, quantity, name: draft.name.trim(), total: calculateTotal(supplier, quantity) } }));
  }
  return <Context.Provider value={{ ...draft,
    setQuantity: value => setDraft(current => ({ ...current, quantityText: value, receipt: null })),
    setSupplier: value => setDraft(current => ({ ...current, supplierId: value, receipt: null })),
    setName: value => setDraft(current => ({ ...current, name: value, receipt: null })), submit,
  }}>{children}</Context.Provider>;
}
export function useRequest() {
  const context = useContext(Context);
  if (!context) throw new Error('RequestProvider is required');
  return context;
}

