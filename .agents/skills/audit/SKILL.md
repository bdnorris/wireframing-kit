---
name: audit
description: Report raw values, unused components, near-duplicates, and repeated overrides.
---

# Audit

Input: a project name, or the library.

1. Run `npm run validate` and report any failures.
2. List project components whose manifest `overrides` the same library name more than once across projects. That pattern should become a variant.
3. List library components that no page imports.
4. List manifests whose descriptions are close enough that an agent might pick either one. Name both and recommend which description to sharpen.
5. Do not delete components in this step. Report only.
