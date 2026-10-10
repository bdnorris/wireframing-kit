# Wireframer

Read `library/registry.json` and the current project's `registry.json` before building or composing anything. The text indexes beside them are the short scan.

1. Use semantic tokens only. No hex, `rgb()`, `hsl()`, named colors, or `px` lengths in components or pages. Keywords, unitless numbers, percentages, `fr`, and `0` are fine.
2. Prefer an existing component, variant, or prop over a new component. Explain any new component in one line. Repeating structures are components.
3. New components start as `draft` in the project's `components/` folder, never directly in `library/`. Scaffold one only when that page's gaps file has an approved entry. Use `npm run new-component -- --project <name> --page <page> --name <component>`.
4. Never edit `registry.json`, `registry.txt`, `tokens.css`, or anything under `dist/` by hand. Run `npm run registry` and `npm run tokens`.
5. Use `media-placeholder` for images, maps, video, and charts. Write real-sounding short copy, not lorem ipsum.
6. Every page uses a layout from `@layouts/default`, `@layouts/landing`, or `@layouts/app`. Pages are composition only: imports, props, and copy. No section markup and no `<style>` in a page.
7. Import components through `@c/<name>`. The resolver checks the importing file's project first, then the library. `PROJECT` chooses which pages build. It does not choose which override wins.
8. Do not import a deprecated component into a new page. Follow `replacedBy`.
9. A redeploy builds against the latest library and can restyle an existing project. The live URL is the pin until then.
10. Run `npm run validate` before finishing. A task is not done until it passes.

## Commands

- `npm run dev` serves every project under `/<project>/` plus `/_gallery`.
- `PROJECT=acme npm run build` writes a root-relative site for that client only.
- `npm run deploy -- acme` builds, runs the leak check, and prints the access checklist. Add `--publish` to upload.

## Layout and nav

`project.json` holds the default nav. Pass `nav` to the layout only when that page differs. With no `PROJECT` set, the layout prefixes links with `/<project>` so local projects do not share a root.

## Gaps

`new-page` writes `projects/<client>/specs/<page>.gaps.json` and does not scaffold a component for an unmatched section. You set `status` to `approved` before a draft can be created.
