---
name: new-page
description: Compose a wireframe page from a spec, or stop with a gap file when a section has no component.
---

# New page

Input: `projects/<client>/specs/<page>.md`.

1. Read `library/registry.txt` and `projects/<client>/registry.txt`.
2. Map each numbered section to a component. Prefer a variant or prop over a new component.
3. Compose matched sections in `projects/<client>/pages/<slug>.astro`. Import one `@layouts/*` layout and `@c/*` components only. Pass props and copy. Do not add section markup or a style block.
4. The route is the filename. `pages/index.astro` is `/`. `pages/pricing.astro` is `/pricing`.
5. When a section matches nothing, write `projects/<client>/specs/<page>.gaps.json`. Each gap has `section`, `proposal` (`variant`, `new-component`, or `compose`), `approach`, and `status: "proposed"`.
6. Do not scaffold a component for a proposed gap. Stop and ask for approval.
7. Run `npm run validate`.
