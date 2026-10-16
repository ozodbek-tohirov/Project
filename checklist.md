# Acceptance checklist
Verified on 2026-10-16 using the production build and local Google Chrome.

## Automated results
- [x] TypeScript and production build: PASS.
- [x] Pricing, formatting and validation: 25/25 unit tests PASS.
- [x] Browser journeys: 9/9 tests PASS.
- [x] Dependency audit after toolchain updates: 0 vulnerabilities.

## Competition requirements
- [x] Fixed A/B/C offers match the ticket, including delivery fees and durations.
- [x] At 5 packs: A 220 000, B 225 000, C 210 000 so‘m.
- [x] At 10 packs: A 420 000, B 415 000, C 420 000 so‘m.
- [x] B / 10 packs confirms 415 000 so‘m with the trimmed customer name.
- [x] A and C review totals also checked; delivery added once.
- [x] Zero, negative, decimal, empty, nonnumeric and unsafe quantities rejected.
- [x] Empty and whitespace-only names rejected; error focuses the input.
- [x] Changing quantity updates cards and selected summary; review uses the same calculation.
- [x] Missing selection disables continuation; direct /confirmation shows helpful empty state.
- [x] Selection, quantity and name survive route navigation; browser back/forward works.
- [x] Success appears only after valid submission; draft changes invalidate it.
- [x] No outbound order POST and no browser runtime errors during the submission journey.
- [x] Increment/decrement, invalid-input recovery, links and keyboard radio selection work.
- [x] Home, comparison and review have no horizontal overflow at 375, 768, 1024 and 1440px.
- [x] Comparison cards stack below 1024px and align in three columns at desktop widths.
- [x] Page headings receive navigation focus; screenshots reviewed for desktop home/comparison and mobile home/review.
- [x] All user-facing content is Uzbek; demo limitations are visible.
- [x] SPA fallback files supplied; direct routes work in the Vite production preview.
- [ ] External hosting deployment and host-specific rewrites: not exercised; local implementation only.

## Correction to original plan
At quantity 7, C alone is cheapest (294 000); A is 300 000. There is no tied minimum at a positive whole-number quantity for the supplied three offers. At 10, A and C tie at 420 000, but B is cheaper. The cheapest helper returns all tied suppliers, verified with a controlled A/C fixture at 10; production data remains unchanged.

## Tooling limitations
Official shadcn CLI generated the six components; shadcn MCP was not exposed.
UI/UX Pro Max instructions and guidelines were applied manually; its Python search could not run because no real Python runtime was available.
Only local Chrome was browser-tested; Firefox, Safari and assistive-technology testing remain unverified.

