import { describe, expect, it } from 'vitest';
import { calculateTotal, cheapestIds, MAX_QUANTITY, formatMoney, parseQuantity, suppliers, validName } from './pricing';
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

