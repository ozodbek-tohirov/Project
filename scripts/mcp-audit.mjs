import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

// Exercise the installed, official MCP server over its standard JSON-RPC transport.
// No second MCP SDK or extra browser download is needed.
const server = spawn(process.execPath, [resolve('node_modules/@playwright/mcp/cli.js'), '--browser', 'chrome', '--isolated', '--headless'], { stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
let buffer = '';
let nextId = 0;
server.stderr.on('data', data => process.stderr.write(data));
server.on('error', error => { pending.forEach(({ reject }) => reject(error)); pending.clear(); });
server.stdout.on('data', data => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    const request = pending.get(message.id);
    if (!request) continue;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  }
});
function call(method, params) {
  const id = ++nextId;
  return new Promise((resolveRequest, reject) => {
    pending.set(id, { resolve: resolveRequest, reject });
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}
async function tool(name, args) {
  const result = await call('tools/call', { name, arguments: args });
  if (result.isError) throw new Error(JSON.stringify(result.content));
  for (const content of result.content ?? []) if (content.type === 'text') console.log(content.text.split('### Ran Playwright code')[0].trim());
  return result;
}
const timeout = setTimeout(() => { server.kill(); process.exit(1); }, 90000);
try {
  await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'tamincompare-audit', version: '1.0' } });
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const { tools } = await call('tools/list', {});
  if (!tools.some(item => item.name === 'browser_run_code_unsafe')) throw new Error('MCP browser execution tool unavailable');
  await tool('browser_run_code_unsafe', { code: `async (page) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const results = [];
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto('http://127.0.0.1:5173/');
      await page.getByRole('heading', { level: 1 }).waitFor();
      const image = page.locator('.benefits-art img');
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      await page.locator('.quantity-presets button').filter({ hasText: '10 pachka' }).click();
      await page.getByRole('link', { name: 'O‘z miqdoringizni kiriting' }).click();
      await page.getByRole('button', { name: '02 Taklifni tanlang' }).click();
      await page.getByRole('radio', { name: 'B ta’minotchi taklifini tanlash' }).check();
      await page.getByRole('button', { name: '03 So‘rovni tasdiqlang' }).click();
      const total = await page.getByTestId('review-total').innerText();
      await page.getByLabel('Ismingiz').fill('Dilnoza');
      await page.getByRole('button', { name: 'Namunaviy so‘rovni tasdiqlash' }).click();
      await page.getByRole('status').waitFor();
      const receiptTotal = await page.getByTestId('receipt-total').innerText();
      const reviewOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (homeOverflow || reviewOverflow || total !== '415 000 so‘m' || receiptTotal !== total) throw new Error('MCP audit failed at width ' + width);
      results.push({ width, total, receiptTotal, overflow: false });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/compare');
    const animations = await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length);
    if (animations || errors.length) throw new Error(JSON.stringify({ animations, errors }));
    return { transport: 'Playwright MCP stdio', results, reducedMotionAnimations: animations, runtimeErrors: errors };
  }` });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
  await call('tools/call', { name: 'browser_close', arguments: {} }).catch(() => {});
  server.stdin.end();
  server.kill();
}
