import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateSupplier, type Supplier, type SupplierFields } from '@/lib/pricing';

const fields: { key: keyof SupplierFields; label: string; hint: string }[] = [
  { key: 'name', label: 'Ta’minotchi nomi', hint: 'Taklifni ajratib turadigan nom' },
  { key: 'unitPrice', label: 'Bir pachka narxi (so‘m)', hint: 'Kamida 1 so‘m, butun son' },
  { key: 'deliveryFee', label: 'Yetkazish haqi (so‘m)', hint: 'Bepul yetkazish uchun 0 kiriting' },
  { key: 'days', label: 'Yetkazish muddati (kun)', hint: 'Kamida 1 kun, butun son' },
];
export function SupplierForm({ supplier, onSave, onClose }: { supplier: Supplier | null; onSave: (values: Omit<Supplier, 'id'>) => void; onClose: () => void }) {
  const [values, setValues] = useState<SupplierFields>(() => supplier ? { name: supplier.name, unitPrice: String(supplier.unitPrice), deliveryFee: String(supplier.deliveryFee), days: String(supplier.days) } : { name: '', unitPrice: '', deliveryFee: '0', days: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFields, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { (formRef.current?.elements.namedItem('name') as HTMLInputElement | null)?.focus(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateSupplier(values);
    setErrors(result.errors);
    if (!result.valid) {
      const field = fields.find(field => result.errors[field.key]);
      if (field) (formRef.current?.elements.namedItem(field.key) as HTMLInputElement)?.focus();
      return;
    }
    onSave(result.values);
  }
  return <Card className="supplier-form-card"><div className="supplier-form-heading"><div><span className="eyebrow">SIZNING TAKLIFINGIZ</span><h2>{supplier ? 'Taklifni tahrirlash' : 'Ta’minotchi qo‘shish'}</h2><p>A4 qog‘oz taklifining narxi va yetkazish shartlarini kiriting.</p></div><Button type="button" variant="ghost" size="icon" aria-label="Ta’minotchi shaklini yopish" onClick={onClose}><X size={19} aria-hidden="true" /></Button></div><form ref={formRef} onSubmit={submit} noValidate><div className="supplier-form-grid">{fields.map(field => <div className="supplier-form-field" key={field.key}><Label htmlFor={'supplier-' + field.key}>{field.label}</Label><Input id={'supplier-' + field.key} name={field.key} type="text" inputMode={field.key === 'name' ? 'text' : 'numeric'} autoComplete="off" value={values[field.key]} required aria-invalid={Boolean(errors[field.key])} aria-describedby={'supplier-' + field.key + '-hint'} onChange={event => { setValues(current => ({ ...current, [field.key]: event.target.value })); setErrors(current => ({ ...current, [field.key]: undefined })); }} /><p id={'supplier-' + field.key + '-hint'} className={errors[field.key] ? 'field-error' : 'field-hint'} role={errors[field.key] ? 'alert' : undefined}>{errors[field.key] ?? field.hint}</p></div>)}</div><div className="supplier-form-footer"><p>Faqat shu brauzerda saqlanadi. A, B va C takliflari o‘zgarmaydi.</p><div><Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button><Button type="submit">{supplier ? <Save size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}{supplier ? 'O‘zgarishlarni saqlash' : 'Taklifni qo‘shish'}</Button></div></div></form></Card>;
}
