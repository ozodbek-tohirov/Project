import { describe, expect, it } from 'vitest';
import { calculateTotal, cheapestIds, MAX_QUANTITY, formatMoney, parseQuantity, suppliers, validName, validateSupplier, quantityLimit } from './pricing';
describe('pricing', () => {
  it('formats money consistently across runtimes', () => expect(formatMoney(415000)).toBe('415 000 so‘m'));
  it.each([{ quantity: 5, totals: [220000,225000,210000] }, { quantity: 10, totals: [420000,415000,420000] }, { quantity: 1, totals: [60000,73000,42000] }])('calculates $quantity packs including delivery once', ({quantity,totals}) => {
    expect(suppliers.map(s => calculateTotal(s, quantity))).toEqual(totals);
  });
  it('finds every cheapest supplier, including ties', () => {
    expect(cheapestIds(5)).toEqual(['C']); expect(cheapestIds(10)).toEqual(['B']); expect(cheapestIds(7)).toEqual(['C']); expect(cheapestIds(10, [suppliers[0], suppliers[2]])).toEqual(['A','C']);
  });
  it.each(['','0','-1','1.5','abc','1e2','Infinity','NaN',' 1 ','1,5',String(MAX_QUANTITY + 1)])('rejects invalid quantity "%s"', value => expect(parseQuantity(value)).toBeNull());
  it('accepts positive digits and safe totals', () => { expect(parseQuantity('0010')).toBe(10); expect(parseQuantity(String(MAX_QUANTITY))).toBe(MAX_QUANTITY); for (const s of suppliers) expect(Number.isSafeInteger(calculateTotal(s,MAX_QUANTITY))).toBe(true); });
  it.each(['',' ','\t\n'])('rejects blank names', value => expect(validName(value)).toBe(false));
  it.each(['O‘tkir','  Dilnoza  ','李 明',"G‘aniyev Ali-Vali"])('accepts natural names', value => expect(validName(value)).toBe(true));
  it('defensively rejects invalid calculation quantities', () => { expect(() => calculateTotal(suppliers[0],0)).toThrow(RangeError); expect(() => calculateTotal(suppliers[0],1.5)).toThrow(RangeError); });
});

describe('custom offers', () => {
  const fields = { name: '  O‘tkir qog‘oz  ', unitPrice: '35000', deliveryFee: '0', days: '2' };
  it('accepts Unicode names, free delivery and positive whole values', () => { const result = validateSupplier(fields); expect(result.valid).toBe(true); expect(result.values).toEqual({name:'O‘tkir qog‘oz',unitPrice:35000,deliveryFee:0,days:2}); });
  it.each(['', ' ', '0', '-1', '1.5', '1e4', 'Infinity', '9007199254740992'])('rejects invalid unit prices %s', value => expect(validateSupplier({...fields,unitPrice:value}).errors.unitPrice).toBeDefined());
  it.each(['', '-1', '2.5', 'abc'])('rejects invalid delivery fees %s', value => expect(validateSupplier({...fields,deliveryFee:value}).errors.deliveryFee).toBeDefined());
  it.each(['', '0', '-1', '1.5'])('rejects invalid delivery durations %s', value => expect(validateSupplier({...fields,days:value}).errors.days).toBeDefined());
  it('rejects blank supplier names and unsafe combined prices', () => { expect(validateSupplier({...fields,name:'  '}).errors.name).toBeDefined(); expect(validateSupplier({...fields,unitPrice:String(Number.MAX_SAFE_INTEGER),deliveryFee:'1'}).valid).toBe(false); });
  it('includes custom offers and every tied minimum', () => { const offer = {id:'custom:tie',name:'Qo‘shimcha',unitPrice:41500,deliveryFee:0,days:1}; expect(calculateTotal(offer,10)).toBe(415000); expect(cheapestIds(10,[...suppliers,offer])).toEqual(['B','custom:tie']); });
  it('limits quantity safely for expensive custom offers', () => { const offers = [...suppliers,{id:'custom:large',name:'Katta narx',unitPrice:Number.MAX_SAFE_INTEGER-1,deliveryFee:1,days:1}]; expect(quantityLimit(offers)).toBe(1); expect(parseQuantity('1',offers)).toBe(1); expect(parseQuantity('2',offers)).toBeNull(); });
});

