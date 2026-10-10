---
name: spec-from-brief
description: Draft page specs from notes, a sitemap, or a screenshot.
---

# Spec from brief

Input: notes, a sitemap, or a screenshot. Figma is out of scope until three prototypes have passed Phase 2.

1. Write one Markdown file per page in `projects/<client>/specs/`.
2. Front matter has `page` and `layout` (`default`, `landing`, or `app`). Omit `nav` unless that page differs from `project.json`.
3. Number the sections in reading order. Describe content, not component names.
4. Put client constraints under `Notes`.
5. Stop for review before composing pages.
