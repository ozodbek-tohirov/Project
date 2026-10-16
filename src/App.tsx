import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCheck, CheckCircle2, ChevronRight, Clock3, FileText, Info, Layers3, Minus, Package, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateTotal, cheapestIds, formatMoney, MAX_QUANTITY, parseQuantity, suppliers, validName, type Supplier, type SupplierId } from '@/lib/pricing';
import { useRequest } from '@/state';

const demoText = 'Bu namunaviy loyiha. Haqiqiy xarid, band qilish yoki xabar yuborish amalga oshirilmaydi.';

function PageFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'A4 qog‘oz xaridi', '/compare': 'Takliflarni taqqoslash', '/confirmation': 'So‘rovni ko‘rib chiqish' };
    document.title = (titles[pathname] ?? 'Sahifa topilmadi') + ' — Ta’minCompare';
    document.querySelector<HTMLElement>('h1')?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Brand() {
  return <Link to="/" className="brand" aria-label="Ta’minCompare — bosh sahifa"><span className="brand-icon"><Layers3 size={22} aria-hidden="true" /></span><span>Ta’min<span className="brand-accent">Compare</span></span></Link>;
}
function Header() {
  return <header className="site-header"><div className="container nav-inner"><Brand /><nav aria-label="Asosiy navigatsiya">
    <NavLink to="/" end className="home-link">Bosh sahifa</NavLink>
    <Button asChild className="nav-cta"><NavLink to="/compare">Narxlarni taqqoslash <ArrowUpRight size={16} aria-hidden="true" /></NavLink></Button>
  </nav></div></header>;
}
function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><Brand /><p>Kichik biznes uchun aniq hisob-kitob.</p><span className="demo-tag"><span />Namoyish loyihasi</span></div></footer>;
}
function DemoNotice({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'demo-notice compact' : 'demo-notice'}><ShieldCheck size={18} aria-hidden="true" /><p>{demoText}</p></div>;
}
function Steps({ current }: { current: 1 | 2 | 3 }) {
  return <ol className="journey" aria-label="So‘rov bosqichlari">{['Miqdorni kiriting', 'Taklifni tanlang', 'So‘rovni tasdiqlang'].map((label, index) =>
    <li key={label} className={index + 1 <= current ? 'active' : ''} aria-current={index + 1 === current ? 'step' : undefined}><span>{index + 1 < current ? <Check size={14} aria-hidden="true" /> : '0' + (index + 1)}</span>{label}{index < 2 && <ChevronRight size={15} className="step-chevron" aria-hidden="true" />}</li>
  )}</ol>;
}
function Home() {
  return <main id="main-content" className="home-page">
    <section className="hero"><div className="hero-mesh" aria-hidden="true" /><div className="container hero-grid"><div className="hero-copy">
      <span className="eyebrow"><span className="tiny-dot" /> KICHIK BIZNES UCHUN XARID YORDAMCHISI</span>
      <h1 tabIndex={-1}>Xaridingiz uchun<br /><span>eng mos taklif.</span></h1>
      <p>A4 qog‘oz uchun uchta ta’minotchining narxi, yetkazish haqi va muddatini bir joyda taqqoslang.</p>
      <Button asChild size="lg"><Link to="/compare">Taqqoslashni boshlash <ArrowRight size={18} aria-hidden="true" /></Link></Button>
      <span className="hero-note"><CheckCircle2 size={15} aria-hidden="true" /> Ro‘yxatdan o‘tish shart emas · Hisoblash bepul</span>
    </div><div className="paper-scene" aria-label="A4 qog‘oz takliflari haqida"><div className="paper-back" /><div className="paper-sheet">
      <div className="sheet-top"><span className="sheet-icon"><FileText size={28} aria-hidden="true" /></span><span className="sheet-a4">A4</span></div>
      <span className="eyebrow">BIZNESINGIZ UCHUN</span><h2>Bir xil mahsulot.<br />Uch xil taklif.</h2>
      <div className="sheet-rules"><span /><span /><span /></div>
      <div className="sheet-bottom"><span>Qog‘oz xaridini<br /><strong>aniq hisoblang.</strong></span><ArrowUpRight size={28} aria-hidden="true" /></div>
    </div><div className="floating-note"><span><CheckCheck size={22} aria-hidden="true" /></span><div><strong>Yashirin xarajatlarsiz</strong><small>Yetkazish haqi jami narxda</small></div></div></div></div></section>
    <section className="container how-section"><div className="section-heading"><div><span className="eyebrow">ODDIY VA TUSHUNARLI</span><h2>To‘g‘ri tanlov — uch qadamda</h2></div><p>Kerakli miqdordan aniq hisob-kitobgacha.</p></div>
      <div className="how-grid">{[
        { icon: Package, title: 'Miqdorni kiriting.', text: 'Nechta pachka A4 qog‘oz kerakligini belgilang.' },
        { icon: Layers3, title: 'Takliflarni solishtiring.', text: 'Jami xarajat va yetkazish muddatini yonma-yon ko‘ring.' },
        { icon: CheckCircle2, title: 'Eng mosini tanlang.', text: 'Tanlovingizni tekshirib, namunaviy so‘rovni tasdiqlang.' },
      ].map(({ icon: Icon, title, text }, index) => <div className="how-item" key={title}><div className="how-top"><span className="how-icon"><Icon size={22} aria-hidden="true" /></span><span className="how-number">0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></div>)}</div>
    </section>
    <section className="container overview-section"><div className="section-heading"><div><span className="eyebrow">TAQQOSLASH UCHUN TAYYOR</span><h2>Uchta ta’minotchi. Bitta aniq hisob.</h2></div><Link to="/compare" className="text-link">Takliflarni ko‘rish <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <div className="overview-grid">{suppliers.map(supplier => <Card className="overview-card" key={supplier.id}><span className={'supplier-avatar avatar-' + supplier.id}>{supplier.id}</span><div><h3>{supplier.name}</h3><p>{formatMoney(supplier.unitPrice)} <span>/ pachka</span></p></div><span className="overview-delivery"><Clock3 size={15} aria-hidden="true" />{supplier.days} kun</span></Card>)}</div>
      <DemoNotice />
    </section>
  </main>;
}
function QuantityControl() {
  const { quantityText, setQuantity } = useRequest();
  const quantity = parseQuantity(quantityText);
  function step(delta: number) { setQuantity(String(quantity === null ? 1 : Math.max(1, Math.min(MAX_QUANTITY, quantity + delta)))); }
  return <section className="quantity-section" aria-labelledby="quantity-label"><div><Label htmlFor="quantity" id="quantity-label" className="quantity-title">Nechta pachka kerak?</Label><p>Bir pachka — hisoblash birligi. Miqdorni o‘zgartirib ko‘ring.</p></div>
    <div className="quantity-field"><div className={'stepper ' + (quantity === null ? 'invalid' : '')}>
      <Button variant="ghost" size="icon" aria-label="Miqdorni kamaytirish" onClick={() => step(-1)} disabled={quantity === 1}><Minus size={18} aria-hidden="true" /></Button>
      <Input id="quantity" type="text" inputMode="numeric" autoComplete="off" value={quantityText} onChange={event => setQuantity(event.target.value)} aria-invalid={quantity === null} aria-describedby={quantity === null ? 'quantity-error' : 'quantity-hint'} />
      <Button variant="ghost" size="icon" aria-label="Miqdorni oshirish" onClick={() => step(1)} disabled={quantity === MAX_QUANTITY}><Plus size={18} aria-hidden="true" /></Button>
    </div><span id="quantity-hint" className="quantity-unit">pachka</span></div>
    {quantity === null && <p id="quantity-error" className="field-error quantity-error" role="alert">{Number(quantityText) > MAX_QUANTITY ? 'Miqdor juda katta. Kichikroq butun son kiriting.' : 'Kamida 1 bo‘lgan butun son kiriting.'}</p>}
  </section>;
}
function SupplierCard({ supplier, cheapest, tied }: { supplier: Supplier; cheapest: boolean; tied: boolean }) {
  const { quantityText, supplierId } = useRequest();
  const quantity = parseQuantity(quantityText);
  const selected = supplierId === supplier.id;
  return <Card className={'supplier-card ' + (selected ? 'selected' : '')} data-testid={'supplier-' + supplier.id}>
    <div className="card-heading"><span className={'supplier-avatar avatar-' + supplier.id}>{supplier.id}</span><span className="card-category">A4 QOG‘OZ</span>{selected && <span className="selected-check" aria-label="Tanlangan"><Check size={15} aria-hidden="true" /></span>}</div>
    <h2>{supplier.name}</h2>
    <div className="card-tag-line">{cheapest ? <span className="best-badge"><Sparkles size={13} aria-hidden="true" />{tied ? 'Eng arzon — teng taklif' : 'Eng arzon taklif'}</span> : <span className="supplier-descriptor">{supplier.id === 'A' ? 'Eng qisqa yetkazish muddati' : supplier.id === 'B' ? 'Bir pachka narxi eng past' : 'Yetkazish haqi olinmaydi'}</span>}</div>
    <dl className="price-details"><div><dt><FileText size={16} aria-hidden="true" />Bir pachka narxi</dt><dd>{formatMoney(supplier.unitPrice)}</dd></div><div><dt><Truck size={16} aria-hidden="true" />Yetkazish haqi</dt><dd className={supplier.deliveryFee === 0 ? 'free-delivery' : ''}>{supplier.deliveryFee === 0 ? 'Bepul' : formatMoney(supplier.deliveryFee)}</dd></div><div><dt><Clock3 size={16} aria-hidden="true" />Yetkazish muddati</dt><dd>{supplier.days} kun</dd></div></dl>
    <div className="card-total"><span>Jami xarajat <small>{quantity === null ? 'Miqdorni tekshiring' : quantity + ' pachka uchun'}</small></span><strong data-testid={'total-' + supplier.id}>{quantity === null ? '—' : formatMoney(calculateTotal(supplier, quantity))}</strong><p>{quantity === null ? 'Hisoblash uchun to‘g‘ri miqdor kiriting.' : quantity + ' × ' + formatMoney(supplier.unitPrice) + ' + ' + formatMoney(supplier.deliveryFee)}</p></div>
    <Label htmlFor={'select-' + supplier.id} className={'select-offer ' + (selected ? 'is-selected' : '')}><RadioGroupItem id={'select-' + supplier.id} value={supplier.id} aria-label={supplier.name + ' taklifini tanlash'} /><span>{selected ? 'Taklif tanlandi' : 'Taklifni tanlash'}</span>{selected ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</Label>
  </Card>;
}
function Compare() {
  const { quantityText, supplierId, setSupplier } = useRequest();
  const quantity = parseQuantity(quantityText);
  const cheapest = quantity === null ? [] : cheapestIds(quantity);
  const selected = suppliers.find(supplier => supplier.id === supplierId);
  const canContinue = quantity !== null && selected !== undefined;
  function handleOfferKeys(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
    const index = radios.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? radios.length - 1 : (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + radios.length) % radios.length;
    event.preventDefault();
    event.stopPropagation();
    setSupplier(radios[nextIndex].value as SupplierId);
    radios[nextIndex].focus();
  }
  return <main id="main-content" className="container workspace"><div className="workspace-top"><span className="eyebrow"><span className="tiny-dot" /> XARIDNI REJALASHTIRING</span><span className="subtle-label"><FileText size={14} aria-hidden="true" /> A4 qog‘oz</span></div>
    <div className="page-heading"><h1 tabIndex={-1}>Yetkazib beruvchilarni taqqoslang</h1><p>Miqdorni kiriting va jami xarajat hamda yetkazish muddatiga qarab eng mos taklifni tanlang.</p></div>
    <Steps current={2} /><QuantityControl />
    <div className="comparison-heading"><h2>Mavjud takliflar <span>3 ta ta’minotchi</span></h2><span className="comparison-legend"><span /> Eng past jami narx belgilanadi</span></div>
    <RadioGroup onKeyDownCapture={handleOfferKeys} value={supplierId ?? ''} onValueChange={value => setSupplier(value as SupplierId)} aria-label="Yetkazib beruvchini tanlang" className="supplier-grid">{suppliers.map(supplier => <SupplierCard key={supplier.id} supplier={supplier} cheapest={cheapest.includes(supplier.id)} tied={cheapest.length > 1} />)}</RadioGroup>
    <div className="calculation-note"><Info size={16} aria-hidden="true" /><p>Jami xarajat = miqdor × bir pachka narxi + yetkazish haqi. Yetkazish haqi buyurtmaga faqat bir marta qo‘shiladi.</p></div>
    <section className={'selection-summary ' + (selected ? 'has-selection' : '')} aria-label="Tanlangan taklif"><div className="summary-icon">{selected ? <CheckCheck size={23} aria-hidden="true" /> : <Package size={23} aria-hidden="true" />}</div><div className="summary-copy"><h2>{selected ? selected.name : 'Sizga mos taklifni tanlang'}</h2><p>{selected ? (quantity === null ? 'Davom etish uchun miqdorni to‘g‘rilang.' : quantity + ' pachka · Yetkazish: ' + selected.days + ' kun') : 'Davom etish uchun yuqoridagi ta’minotchilardan birini belgilang.'}</p></div><div className="summary-action">{selected && <strong data-testid="selected-total">{quantity === null ? '—' : formatMoney(calculateTotal(selected, quantity))}</strong>}{canContinue ? <Button asChild><Link to="/confirmation">So‘rovni ko‘rib chiqish <ArrowRight size={17} aria-hidden="true" /></Link></Button> : <Button disabled>So‘rovni ko‘rib chiqish <ArrowRight size={17} aria-hidden="true" /></Button>}</div></section>
    <DemoNotice compact />
  </main>;
}
function Confirmation() {
  const { quantityText, supplierId, name, setName, receipt, submit } = useRequest();
  const quantity = parseQuantity(quantityText);
  const supplier = suppliers.find(item => item.id === supplierId);
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (receipt) successRef.current?.focus(); }, [receipt]);
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validName(name)) { setNameError(true); nameRef.current?.focus(); return; }
    setNameError(false); submit();
  }
  if (!supplier || quantity === null) return <main id="main-content" className="container empty-page"><span className="empty-icon"><Package size={35} aria-hidden="true" /></span><span className="eyebrow">AVVAL TAKLIFNI TANLANG</span><h1 tabIndex={-1}>Hali taklif tanlanmagan</h1><p>So‘rovni ko‘rib chiqish uchun miqdorni kiriting va o‘zingizga mos ta’minotchini tanlang.</p><Button asChild><Link to="/compare">Takliflarni taqqoslash <ArrowRight size={17} aria-hidden="true" /></Link></Button><DemoNotice compact /></main>;
  const total = calculateTotal(supplier, quantity);
  return <main id="main-content" className="container workspace confirmation-page"><Link to="/compare" className="back-link"><ArrowLeft size={16} aria-hidden="true" />Taqqoslashga qaytish</Link><div className="page-heading"><h1 tabIndex={-1}>Tanlovingizni ko‘rib chiqing</h1><p>Hisob-kitobni tekshiring va ismingizni kiritib, namunaviy so‘rovni tasdiqlang.</p></div><Steps current={3} />
    {receipt ? <div className="success-panel" ref={successRef} tabIndex={-1} role="status"><span className="success-icon"><CheckCircle2 size={38} aria-hidden="true" /></span><span className="eyebrow">NAMUNAVIY SO‘ROV TASDIQLANDI</span><h2>Rahmat, {receipt.name}!</h2><p>Tanlovingiz quyida ko‘rsatilgan. Haqiqiy xarid amalga oshirilmadi va ta’minotchiga xabar yuborilmadi.</p><dl className="receipt-details"><div><dt>Ta’minotchi</dt><dd>{supplier.name}</dd></div><div><dt>Miqdor</dt><dd>{receipt.quantity} pachka</dd></div><div><dt>Ism</dt><dd>{receipt.name}</dd></div><div><dt>Jami xarajat</dt><dd data-testid="receipt-total">{formatMoney(receipt.total)}</dd></div></dl><Button asChild variant="outline"><Link to="/compare">Taqqoslashga qaytish <ArrowRight size={17} aria-hidden="true" /></Link></Button></div> :
    <div className="review-grid"><Card className="review-card"><div className="review-title"><span className={'supplier-avatar avatar-' + supplier.id}>{supplier.id}</span><div><span className="eyebrow">TANLANGAN TAKLIF</span><h2>{supplier.name}</h2></div><span className="review-product"><FileText size={17} aria-hidden="true" />A4 qog‘oz</span></div><dl className="review-details"><div><dt>Pachkalar soni</dt><dd>{quantity} pachka</dd></div><div><dt>Bir pachka narxi</dt><dd>{formatMoney(supplier.unitPrice)}</dd></div><div><dt>Yetkazish haqi</dt><dd>{supplier.deliveryFee === 0 ? 'Bepul' : formatMoney(supplier.deliveryFee)}</dd></div><div><dt>Yetkazish muddati</dt><dd>{supplier.days} kun</dd></div></dl><div className="review-total"><span>Jami xarajat<small>Yetkazish haqi hisobga olingan</small></span><strong data-testid="review-total">{formatMoney(total)}</strong></div><p className="review-equation">{quantity} × {formatMoney(supplier.unitPrice)} + {formatMoney(supplier.deliveryFee)}</p></Card>
      <Card className="customer-card"><span className="form-icon"><FileText size={24} aria-hidden="true" /></span><h2>So‘rovni tasdiqlash</h2><p>Namuna uchun faqat ismingiz kerak.</p><form onSubmit={handleSubmit} noValidate><Label htmlFor="customer-name">Ismingiz <span aria-hidden="true">*</span></Label><Input ref={nameRef} id="customer-name" autoComplete="given-name" placeholder="Ismingizni kiriting" value={name} required aria-invalid={nameError} aria-describedby={nameError ? 'name-error' : undefined} onChange={event => { setName(event.target.value); if (validName(event.target.value)) setNameError(false); }} />{nameError && <p id="name-error" role="alert" className="field-error">Ismingizni kiriting. Faqat bo‘sh joylardan iborat ism qabul qilinmaydi.</p>}<Button type="submit">Namunaviy so‘rovni tasdiqlash <ArrowRight size={17} aria-hidden="true" /></Button></form><Alert role="note" className="form-alert"><ShieldCheck size={17} aria-hidden="true" /><AlertDescription>Bu faqat namoyish. To‘lov olinmaydi va so‘rov hech qayerga yuborilmaydi.</AlertDescription></Alert></Card></div>}
    <DemoNotice compact />
  </main>;
}
function NotFound() { return <main id="main-content" className="container empty-page"><h1 tabIndex={-1}>Sahifa topilmadi</h1><p>Kerakli taklifni taqqoslash sahifasidan topishingiz mumkin.</p><Button asChild><Link to="/compare">Takliflarga o‘tish <ArrowRight size={17} aria-hidden="true" /></Link></Button></main>; }
export function App() {
  return <><a className="skip-link" href="#main-content">Asosiy mazmunga o‘tish <ArrowDown size={16} aria-hidden="true" /></a><Header /><PageFocus /><Routes><Route path="/" element={<Home />} /><Route path="/compare" element={<Compare />} /><Route path="/confirmation" element={<Confirmation />} /><Route path="*" element={<NotFound />} /></Routes><Footer /></>;
}

