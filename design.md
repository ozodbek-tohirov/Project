# Ta’minCompare design
Reference: stripe.design.md, retained unchanged. Local React application; comparison is the primary workspace.
- Indigo #533afd, pressed #2e2b8c, ink #0d253d, muted #526479, white and #f6f9fc surfaces, borders #e3e8ee.
- Semantic additions: success #147d52 with pale green surface; error #b42318 with pale red surface.
- Inter: 300 display, 400 body, 500 labels, 600 totals; tabular numeric figures. System fallback. Body 15–16px.
- 1200px container; 8px spacing scale; 12–16px cards; pill actions; static atmospheric gradient only on introduction.
- Selected state: indigo border + checked radio. Cheapest: green badge, including all tied suppliers. Neither implies the other.
- Desktop: three equal supplier columns; below 1024px: stacked cards. Summary remains in normal flow.
- Visible focus, semantic labels, 44px targets, 4.5:1 normal text contrast, reduced-motion support.
- Adapt reference for utility: no proprietary fonts, fake dashboards, oversized footer, account buttons, or animated mesh.
- UI/UX Pro Max and React skills apply. Design-system search currently blocked by missing Python runtime. shadcn MCP unavailable; official CLI is the component-generation fallback.

