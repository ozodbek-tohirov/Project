# Ta’minCompare implementation

## Run locally
Use Node.js 22.12+ and npm.
- `npm install`
- `npm run dev`
- `npm run build` creates `dist/`; `npm run preview` serves the production build.
- `npm test` runs the pricing/validation tests.
- `npm run test:e2e` runs browser tests against the production build using installed Google Chrome. Run `npm run build` first. To use Playwright Chromium instead, remove `channel: 'chrome'` from the test config and run `npx playwright install chromium`.

On this machine Node is installed but initially absent from PATH. For the current PowerShell session:
```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
npm run dev
```

## Architecture
React + Vite + TypeScript, Tailwind CSS, official CLI-generated shadcn/ui components, Lucide, React Router.
Routes: `/` introduction, `/compare` main workspace, `/confirmation` review or empty state; unknown routes show a helpful page.
A context above routes owns quantity text, supplier ID, customer name and submitted snapshot. Edits invalidate success; refresh resets the demo.
The immutable supplier dataset and shared total calculation live in `src/lib/pricing.ts`. Totals and cheapest suppliers are derived, not duplicated in state. Delivery is added once.
Quantity must contain positive decimal digits and produce safe integer totals. Names are trimmed and required. Steppers restore invalid input to 1.
Currency grouping is normalized using Intl parts to remain consistent between Node and Chrome.
Radio navigation handles arrows, Home and End synchronously to avoid Radix deferred-focus timing races.
No backend, authentication, payments, storage or outbound order submission. Fonts are bundled locally.

## Hosting
Serve `dist/` with a fallback to `index.html`. `public/_redirects` supports Netlify-style static hosting and `vercel.json` supplies Vercel rewrites. Other hosts need an equivalent SPA fallback. This task implements the local app; no hosting account was registered or deployed.

## Demonstration
Set quantity to 5 and compare totals. Change to 10, select B, review 415 000 so‘m. Submit a blank name to show validation, then enter a name and confirm. Explain that no purchase or message was sent.

## Verification
Production build passed, 25 unit tests passed, 12 Chrome browser tests passed. Screenshots are in ignored `test-results/`; HTML report in ignored `playwright-report/`. See `checklist.md` for coverage and limits.
Correction: quantity 7 does not produce a lowest-price tie; C is cheapest. Tie handling is tested using a controlled subset, preserving supplied prices.

## Tooling
Patched Vite/Vitest versions resolve the initial dependency advisories; npm audit reported zero vulnerabilities.
shadcn MCP unavailable: used the official shadcn CLI to generate components, then corrected its alias output and retained local utilities.
UI/UX Pro Max search blocked by absent Python runtime; its instructions and available UX guidelines were applied manually. Stripe reference remains unchanged.

Playwright MCP is installed as `@playwright/mcp`. Start it for an MCP client with `npm run mcp:playwright`; it uses the installed Chrome channel and an isolated browser profile. The package entrypoint is also available through `npx playwright-mcp --help`.

## Visual and interaction refinements
The existing design.md and stripe.design.md are retained unchanged. Supporting text is larger, focus/hover/selected states clearer, and desktop/mobile layouts retain the original structure.
Jitter-inspired motion uses native Web Animations, CSS, a one-shot IntersectionObserver and a passive, requestAnimationFrame-throttled hero parallax listener. No animation dependency was added. Reduced-motion changes cancel active reveals and parallax, and disable page/typography/feedback transitions. Exact prices update immediately; only emphasis animates.
All three step buttons navigate to the actual task. Invalid confirmation attempts route to quantity or offer selection and show guidance. Supplier cards can be selected from their body or radio; keyboard controls are preserved. Homepage supplier links carry the choice into comparison.
Homepage additions: original local SVG paper illustration, practical benefits, a shared-state 5/10-pack pricing example, and a working comparison CTA. No invented statistics or supplier claims.
Run `npm run test:mcp` with the development server running at http://127.0.0.1:5173. This connects to the installed official Playwright MCP server over stdio and tests the real site at 375/768/1024/1440px, including illustration loading, quantity persistence, clickable steps, B/10 confirmation, overflow, browser errors and reduced motion. MCP logs are ignored in .playwright-mcp/.

