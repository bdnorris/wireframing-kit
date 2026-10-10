---
name: new-component
description: Scaffold a draft project component after a gap has been approved.
---

# New component

Input: an approved gap, a project, a page, and a component name.

1. Confirm `projects/<client>/specs/<page>.gaps.json` has a gap with `status: "approved"` and proposal `new-component` or `variant`. If it is still `proposed`, stop.
2. Run `npm run new-component -- --project <client> --page <page> --name <component>`.
3. Replace the scaffold copy, props, and styles. Use semantic tokens only. Set `data-component` to the folder name. Keep `status` as `draft`.
4. The description must say when to use the component and when not to.
5. Run `npm run registry` and `npm run validate`.
