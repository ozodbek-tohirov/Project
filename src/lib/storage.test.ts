import { describe, expect, it } from 'vitest';
import { decodeSavedData, emptySavedData, type Receipt } from './storage';
const supplier = { id:'custom:sample',name:'Qog‘oz markazi',unitPrice:35000,deliveryFee:10000,days:2 };
const receipt: Receipt = {id:'receipt-1',createdAt:'2026-10-16T08:00:00.000Z',supplierId:supplier.id,supplier:{...supplier},quantity:10,name:'Dilnoza',total:360000};
const data = () => ({...emptySavedData(),customSuppliers:[{...supplier}],draft:{quantityText:'10',supplierId:supplier.id,name:'Dilnoza'},history:[{...receipt,supplier:{...supplier}}]});
describe('browser persistence validation', () => {
  it('loads an empty session when no data exists', () => expect(decodeSavedData(null)).toEqual({data:emptySavedData(),warning:null}));
  it.each(['{broken','null','[]','{"version":2}'])('handles invalid storage %s', raw => { expect(decodeSavedData(raw).data).toEqual(emptySavedData()); expect(decodeSavedData(raw).warning).toBeTruthy(); });
  it('roundtrips valid draft, custom offer and receipt snapshots', () => expect(decodeSavedData(JSON.stringify(data()))).toEqual({data:data(),warning:null}));
  it('rejects attempts to override base offers and duplicate custom ids', () => { const state = data(); state.customSuppliers.push({...supplier,id:'A'}, {...supplier}); const result=decodeSavedData(JSON.stringify(state)); expect(result.data.customSuppliers).toHaveLength(1); expect(result.warning).toBeTruthy(); });
  it('drops invalid custom prices and clears dangling selection', () => { const state=data(); state.customSuppliers[0].unitPrice=-1; const result=decodeSavedData(JSON.stringify(state)); expect(result.data.customSuppliers).toEqual([]); expect(result.data.draft.supplierId).toBeNull(); expect(result.data.history).toHaveLength(1); });
  it('retains historical prices when the current supplier changes', () => { const state=data(); state.customSuppliers[0].unitPrice=60000; const result=decodeSavedData(JSON.stringify(state)); expect(result.data.customSuppliers[0].unitPrice).toBe(60000); expect(result.data.history[0].supplier.unitPrice).toBe(35000); expect(result.data.history[0].total).toBe(360000); });
  it('retains receipts after the custom supplier has been deleted', () => { const state=data(); state.customSuppliers=[]; expect(decodeSavedData(JSON.stringify(state)).data.history).toEqual([receipt]); });
  it('rejects invalid and duplicate receipt records', () => { const state=data(); state.history.push({...receipt}, {...receipt,id:'wrong-total',total:1}, {...receipt,id:'bad-date',createdAt:'bad'}); const result=decodeSavedData(JSON.stringify(state)); expect(result.data.history).toEqual([receipt]); expect(result.warning).toBeTruthy(); });
  it('restores invalid quantity text as a draft without treating it as a success', () => { const state=data(); state.draft.quantityText='0'; const result=decodeSavedData(JSON.stringify(state)); expect(result.data.draft.quantityText).toBe('0'); expect(result.data).not.toHaveProperty('receipt'); });
});
