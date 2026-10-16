import { test, expect } from '@playwright/test';

test('introduction guides the user to comparison', async ({page}) => {
  await page.goto('/'); await expect(page).toHaveTitle(/Ta’minCompare/);
  await page.getByRole('link', {name:'Taqqoslashni boshlash'}).click();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(page.getByRole('heading', {name:'Yetkazib beruvchilarni taqqoslang'})).toBeFocused();
});
test('totals, ties, selection, validation, state preservation and submission', async ({page}) => {
  const errors: string[] = []; const outbound: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() === 'POST') outbound.push(request.url()); });
  await page.goto('/compare');


  const input = page.getByRole('textbox', {name:'Nechta pachka kerak?'});

  await expect(page.getByRole('button',{name:'So‘rovni ko‘rib chiqish'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Miqdorni kamaytirish'})).toBeDisabled();
  for (const [value, totals] of [['5',['220 000 so‘m','225 000 so‘m','210 000 so‘m']], ['10',['420 000 so‘m','415 000 so‘m','420 000 so‘m']]] as const) {
    await input.fill(value);
    for (let i=0;i<3;i++) await expect(page.getByTestId('total-' + ['A','B','C'][i])).toHaveText(totals[i]);
  }
  await input.fill('7'); await expect(page.getByText('Eng arzon taklif',{exact:true})).toHaveCount(1); await expect(page.getByTestId('supplier-C')).toContainText('Eng arzon taklif');
  await input.fill('10');
  await page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'}).check();
  await expect(page.getByTestId('selected-total')).toHaveText('415 000 so‘m');
  await input.fill('5'); await expect(page.getByTestId('selected-total')).toHaveText('225 000 so‘m');
  await input.fill('10');
  await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
  await expect(page.getByTestId('review-total')).toHaveText('415 000 so‘m');
  await expect(page.getByRole('status')).toHaveCount(0);
  const name = page.getByLabel('Ismingiz',{exact:false});
  const submit = page.getByRole('button',{name:'Namunaviy so‘rovni tasdiqlash'});
  await submit.click(); await expect(name).toBeFocused(); await expect(name).toHaveAttribute('aria-invalid','true');
  await name.fill('   '); await submit.click(); await expect(page.getByRole('alert').filter({hasText:'Ismingizni kiriting.'})).toBeVisible();
  await name.fill('  O‘tkir  ');
  await page.getByRole('link',{name:'Taqqoslashga qaytish'}).click();
  await expect(input).toHaveValue('10'); await expect(page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'})).toBeChecked();
  await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click(); await expect(name).toHaveValue('  O‘tkir  ');
  await submit.click(); await expect(page.getByRole('status')).toContainText('Rahmat, O‘tkir!');
  await expect(page.getByTestId('receipt-total')).toHaveText('415 000 so‘m');
  await page.getByRole('status').getByRole('link',{name:'Taqqoslashga qaytish'}).click(); await input.fill('5');
  await page.getByRole('radio',{name:'A ta’minotchi taklifini tanlash'}).check();
  await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
  await expect(page.getByRole('status')).toHaveCount(0); await expect(page.getByTestId('review-total')).toHaveText('220 000 so‘m');
  await submit.click(); await expect(page.getByTestId('receipt-total')).toHaveText('220 000 so‘m');
  expect(errors).toEqual([]); expect(outbound).toEqual([]);
});
test('invalid quantities cannot continue and stepper recovers', async ({page}) => {
  await page.goto('/compare');
  await page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'}).check();
  const input = page.getByRole('textbox',{name:'Nechta pachka kerak?'});
  for (const value of ['0','-3','1.5','','abc','99999999999999999']) {
    await input.fill(value); await expect(input).toHaveAttribute('aria-invalid','true');
    await expect(page.getByTestId('total-A')).toHaveText('—');
    await expect(page.getByTestId('selected-total')).toHaveText('—');
    await expect(page.getByRole('button',{name:'So‘rovni ko‘rib chiqish'})).toBeDisabled();
    await expect(page.getByText('Eng arzon taklif',{exact:true})).toHaveCount(0);
  }
  await page.getByRole('button',{name:'Miqdorni kamaytirish'}).click(); await expect(input).toHaveValue('1');
  await page.getByRole('button',{name:'Miqdorni oshirish'}).click(); await expect(input).toHaveValue('2');
  await input.fill(''); await page.getByRole('button',{name:'Miqdorni oshirish'}).click(); await expect(input).toHaveValue('1');
});
test('direct review access is helpful and back/forward preserves draft', async ({page}) => {
  await page.goto('/confirmation'); await expect(page.getByRole('heading',{name:'Hali taklif tanlanmagan'})).toBeVisible();
  await page.getByRole('link',{name:'Takliflarni taqqoslash'}).click();
  await page.getByRole('textbox',{name:'Nechta pachka kerak?'}).fill('10');
  await page.getByRole('radio',{name:'C ta’minotchi taklifini tanlash'}).check();
  await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
  await expect(page.getByTestId('review-total')).toHaveText('420 000 so‘m');
  await page.goBack(); await expect(page.getByRole('textbox',{name:'Nechta pachka kerak?'})).toHaveValue('10');
  await page.goForward(); await expect(page.getByTestId('review-total')).toHaveText('420 000 so‘m');
  await page.reload(); await expect(page.getByTestId('review-total')).toHaveText('420 000 so‘m'); await expect(page.getByRole('status')).toHaveCount(0);
});
test('radio selection is keyboard accessible', async ({page}) => {
  await page.goto('/compare');
  const first = page.getByRole('radio',{name:'A ta’minotchi taklifini tanlash'});
  await first.focus(); await page.keyboard.press('Space'); await expect(first).toBeChecked();
  await page.keyboard.press('ArrowRight'); await expect(page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'})).toBeChecked();
});
test('all three step controls navigate to the real task and guard review', async ({page}) => {
  await page.goto('/compare');
  await page.getByRole('button', {name:'03 So‘rovni tasdiqlang'}).click();
  await expect(page).toHaveURL(/\/compare#offers$/);
  await expect(page.getByRole('status')).toContainText('takliflardan birini tanlang');
  await page.getByRole('button', {name:'01 Miqdorni kiriting'}).click();
  await expect(page.getByRole('textbox', {name:'Nechta pachka kerak?'})).toBeFocused();
  await page.getByRole('textbox', {name:'Nechta pachka kerak?'}).fill('0');
  await page.getByRole('button', {name:'03 So‘rovni tasdiqlang'}).click();
  await expect(page).toHaveURL(/#quantity$/);
  await expect(page.getByRole('status')).toContainText('butun miqdorni kiriting');
  await page.getByRole('textbox', {name:'Nechta pachka kerak?'}).fill('10');
  await page.getByRole('button', {name:'02 Taklifni tanlang'}).click();
  await expect(page.getByRole('radio', {name:'A ta’minotchi taklifini tanlash'})).toBeFocused();
  await page.getByTestId('supplier-B').getByRole('heading').click();
  await expect(page.getByRole('radio', {name:'B ta’minotchi taklifini tanlash'})).toBeChecked();
  await page.getByRole('button', {name:'03 So‘rovni tasdiqlang'}).click();
  await expect(page.getByTestId('review-total')).toHaveText('415 000 so‘m');
  await page.getByRole('button', {name:'01 Miqdorni kiriting'}).click();
  await expect(page.getByRole('textbox', {name:'Nechta pachka kerak?'})).toHaveValue('10');
});
test('homepage calculator and supplier links carry choices into comparison', async ({page}) => {
  await page.goto('/');
  const preset = page.getByRole('button', {name:'10 pachka', exact:true});
  await preset.click();
  await expect(preset).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.example-best')).toContainText('B ta’minotchi');
  await expect(page.locator('.example-best')).toContainText('415 000 so‘m');
  await page.getByRole('link', {name:'B ta’minotchi taklifini ko‘rish'}).click();
  await expect(page.getByRole('textbox', {name:'Nechta pachka kerak?'})).toHaveValue('10');
  await expect(page.getByRole('radio', {name:'B ta’minotchi taklifini tanlash'})).toBeChecked();
  await expect(page.getByTestId('selected-total')).toHaveText('415 000 so‘m');
});
test('reduced motion keeps content visible and stops animation and parallax', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByRole('heading', {name:/Eng past narx har doim/})).toBeVisible();
  await page.locator('.benefits-art img').scrollIntoViewIfNeeded();
  expect(await page.locator('.benefits-art img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  expect(await page.locator('.paper-scene').evaluate(element => getComputedStyle(element).transform)).toBe('none');
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});
for (const width of [375,768,1024,1440]) {
  test('responsive layouts at ' + width, async ({page}) => {
    await page.setViewportSize({width,height:1000});
    for (const route of ['/','/compare']) {
      await page.goto(route);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (route === '/compare') {
        const cards = await page.locator('.supplier-card').all();
        const first = await cards[0].boundingBox(); const second = await cards[1].boundingBox();
        expect(first).not.toBeNull(); expect(second).not.toBeNull();
        if (width >= 1024) expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
        else expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      }
      await page.screenshot({path:'test-results/' + width + (route === '/' ? '-home' : '-compare') + '.png',fullPage:true, animations:'disabled'});
    }
    await page.getByRole('radio',{name:'B ta’minotchi taklifini tanlash'}).check();
    await page.getByRole('link',{name:'So‘rovni ko‘rib chiqish'}).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({path:'test-results/' + width + '-confirmation.png',fullPage:true, animations:'disabled'});
  });
}

