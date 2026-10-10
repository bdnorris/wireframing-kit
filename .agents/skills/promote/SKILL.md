---
name: promote
description: Move a reviewed draft component into the shared library.
---

# Promote

Input: a project component that is ready to share.

1. Generalize props so the component is not tied to one client's copy.
2. Move the folder to `library/components/<name>/`. Set `status` to `stable` and remove `overrides`.
3. If the prop names change, update the source page in the same change.
4. Delete the project copy so `@c/<name>` resolves to the library.
5. Run `npm run registry`. The diff of `library/registry.json` is the review surface, along with `/_gallery`.
6. Do not rewrite other projects' pages unless they import the old prop names.
