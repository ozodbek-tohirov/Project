import { test, expect, type Page } from '@playwright/test';

async function addSupplier(page: Page, name='Qog‘oz markazi', price='35000', fee='10000') {
  await page.getByRole('button',{name:'Ta’minotchi qo‘shish',exact:true}).click();
  await page.getByLabel('Ta’minotchi nomi',{exact:true}).fill(name);
  await page.getByLabel('Bir pachka narxi (so‘m)',{exact:true}).fill(price);
  await page.getByLabel('Yetkazish haqi (so‘m)',{exact:true}).fill(fee);
  await page.getByLabel('Yetkazish muddati (kun)',{exact:true}).fill('2');
  await page.getByRole('button',{name:'Taklifni qo‘shish',exact:true}).click();
  return page.locator('.supplier-card').filter({has:page.getByRole('heading',{name,exact:true})});
}
test('custom supplier joins pricing, ties, selection and review; base offers remain protected',async({page})=>{
  await page.goto('/compare');
  const card = await addSupplier(page,'Qo‘shimcha taklif','41500','0');
  await page.getByRole('textbox',{name:'Nechta pachka kerak?'}).fill('10');
  await expect(card).toContainText('Siz qo‘shgan taklif');
  await expect(card.locator('.card-total strong')).toHaveText('415 000 so‘m');
  await expect(page.getByText('Eng arzon — teng taklif',{exact:true})).toHaveCount(2);
  for(const id of ['A','B','C']) await expect(page.getByTestId('supplier-'+id).getByRole('button',{name:/tahrirlash|o‘chirish/})).toHaveCount(0);
  await card.getByRole('radio').check(); await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
  await expect(page.getByTestId('review-total')).toHaveText('415 000 so‘m');
  await expect(page.locator('.review-title')).toContainText('Qo‘shimcha taklif');
});
test('supplier form rejects invalid values, focuses errors and can be cancelled',async({page})=>{
  await page.goto('/compare'); await page.getByRole('button',{name:'Ta’minotchi qo‘shish',exact:true}).click();
  const name=page.getByLabel('Ta’minotchi nomi',{exact:true});
  await expect(name).toBeFocused(); await name.fill('   ');
  await page.getByRole('button',{name:'Taklifni qo‘shish',exact:true}).click();
  await expect(name).toBeFocused(); await expect(name).toHaveAttribute('aria-invalid','true');
  await name.fill('Yangi');
  await page.getByLabel('Bir pachka narxi (so‘m)',{exact:true}).fill('0');
  await page.getByLabel('Yetkazish haqi (so‘m)',{exact:true}).fill('-1');
  await page.getByLabel('Yetkazish muddati (kun)',{exact:true}).fill('1.5');
  await page.getByRole('button',{name:'Taklifni qo‘shish',exact:true}).click();
  await expect(page.getByLabel('Bir pachka narxi (so‘m)',{exact:true})).toHaveAttribute('aria-invalid','true');
  await expect(page.getByLabel('Yetkazish haqi (so‘m)',{exact:true})).toHaveAttribute('aria-invalid','true');
  await expect(page.getByLabel('Yetkazish muddati (kun)',{exact:true})).toHaveAttribute('aria-invalid','true');
  await page.getByRole('button',{name:'Bekor qilish',exact:true}).click();
  await expect(page.locator('.supplier-form-card')).toHaveCount(0); await expect(page.locator('.supplier-card')).toHaveCount(3);
});
test('draft and custom suppliers survive refresh; reset keeps saved offers',async({page})=>{
  await page.goto('/compare'); const card=await addSupplier(page);
  await page.getByRole('textbox',{name:'Nechta pachka kerak?'}).fill('10'); await card.getByRole('radio').check();
  await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click(); await page.getByLabel('Ismingiz').fill('Dilnoza');
  await page.reload(); await expect(page.getByTestId('review-total')).toHaveText('360 000 so‘m'); await expect(page.getByLabel('Ismingiz')).toHaveValue('Dilnoza'); await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByRole('link',{name:'Taqqoslashga qaytish',exact:true}).click(); await page.getByRole('button',{name:'Yangi hisob-kitob'}).click();
  await expect(page.getByRole('textbox',{name:'Nechta pachka kerak?'})).toHaveValue('1'); await expect(page.getByRole('radio',{checked:true})).toHaveCount(0); await expect(card).toBeVisible();
  await page.reload(); await expect(page.locator('.supplier-card')).toHaveCount(4);
});
test('history snapshots survive editing/deleting suppliers and can restore a deleted offer',async({page})=>{
  await page.goto('/history'); await expect(page.getByRole('heading',{name:'Hali saqlangan so‘rov yo‘q'})).toBeVisible();
  await page.getByRole('link',{name:'Taqqoslashni boshlash'}).click(); const card=await addSupplier(page);
  await page.getByRole('textbox',{name:'Nechta pachka kerak?'}).fill('10'); await card.getByRole('radio').check(); await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
  await page.getByLabel('Ismingiz').fill('  O‘tkir  '); await page.getByRole('button',{name:'Namunaviy so‘rovni tasdiqlash'}).click();
  await expect(page.getByTestId('receipt-total')).toHaveText('360 000 so‘m');
  await page.getByRole('link',{name:'So‘rovlar tarixini ko‘rish'}).click(); await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await page.locator('.history-breakdown summary').click(); await expect(page.getByTestId('history-entry')).toContainText('O‘tkir');
  await page.reload(); await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await page.getByRole('button',{name:'Qayta hisoblash'}).click(); await card.getByRole('button',{name:'Qog‘oz markazi taklifini tahrirlash'}).click();
  await page.getByLabel('Bir pachka narxi (so‘m)',{exact:true}).fill('60000'); await page.getByRole('button',{name:'O‘zgarishlarni saqlash'}).click(); await expect(page.getByTestId('selected-total')).toHaveText('610 000 so‘m');
  await page.getByRole('link',{name:'So‘rovlar tarixi',exact:false}).first().click(); await expect(page.getByTestId('history-entry')).toContainText('360 000 so‘m');
  await page.getByRole('button',{name:'Qayta hisoblash'}).click(); await expect(page.getByTestId('selected-total')).toHaveText('610 000 so‘m');
  await card.getByRole('button',{name:'Qog‘oz markazi taklifini o‘chirish'}).click(); await card.getByRole('button',{name:'Ha, o‘chirish'}).click(); await expect(card).toHaveCount(0); await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);
  await page.getByRole('link',{name:'So‘rovlar tarixi',exact:false}).first().click(); await page.getByRole('button',{name:'Qayta hisoblash'}).click(); await expect(card).toBeVisible(); await expect(page.getByTestId('selected-total')).toHaveText('360 000 so‘m');
  await page.getByRole('link',{name:'So‘rovlar tarixi',exact:false}).first().click(); await page.getByRole('button',{name:'O‘chirish',exact:true}).click(); await page.getByRole('button',{name:'Bekor qilish'}).click(); await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await page.getByRole('button',{name:'O‘chirish',exact:true}).click(); await page.getByRole('button',{name:'Ha, o‘chirish'}).click(); await expect(page.getByRole('heading',{name:'Hali saqlangan so‘rov yo‘q'})).toBeVisible();
  await page.reload(); await expect(page.getByTestId('history-entry')).toHaveCount(0);
});
test('corrupt storage and blocked storage do not break comparison',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('tamincompare:v1','broken json'));
  await page.goto('/compare'); await expect(page.getByRole('note')).toContainText('tiklab bo‘lmadi'); await expect(page.getByTestId('total-A')).toHaveText('60 000 so‘m');
});
test('storage write failure warns without blocking a simulated request',async({page})=>{
  await page.addInitScript(()=>{ Storage.prototype.setItem=()=>{throw new DOMException('Quota','QuotaExceededError');}; });
  await page.goto('/compare'); await expect(page.locator('.storage-warning')).toContainText('saqlab bo‘lmadi');
  await page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'}).check(); await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click(); await page.getByLabel('Ismingiz').fill('Dilnoza'); await page.getByRole('button',{name:'Namunaviy so‘rovni tasdiqlash'}).click(); await expect(page.getByTestId('receipt-total')).toHaveText('73 000 so‘m');
});
for(const width of [375,768,1440]) test('custom form and history fit at '+width,async({page})=>{
  await page.setViewportSize({width,height:1000}); await page.goto('/compare'); const card=await addSupplier(page,'Shaxsiy qog‘oz taklifi');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await card.getByRole('radio').check(); await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click(); await page.getByLabel('Ismingiz').fill('Dilnoza'); await page.getByRole('button',{name:'Namunaviy so‘rovni tasdiqlash'}).click(); await page.getByRole('link',{name:'So‘rovlar tarixini ko‘rish'}).click();
  await page.locator('.history-breakdown summary').click(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/'+width+'-history.png',fullPage:true,animations:'disabled'});
});
