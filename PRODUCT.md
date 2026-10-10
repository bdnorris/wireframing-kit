# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One operator for now: the repo owner, who writes short page specs and drives an agent to turn them into deployable wireframe prototypes. Client stakeholders see only the deployed prototype URLs, often behind Cloudflare Access, and refer to blocks by name through the annotation overlay (`A` key). They never use the repo.

## Product Purpose

Wireframer turns a short Markdown page spec into a deployable wireframe prototype in under 15 minutes of agent time. It does this by composing from one shared, growing component library that is styled only by design tokens. Every project should leave the library better than it found it. The success test is Gate 2: three client prototypes come out clean, with at least one gap approved, drafted and promoted.

## Positioning

An agent-native wireframing kit with mechanical guardrails. A registry tells the agent what exists, and gap reports stop the agent for approval before it adds a component. Lint, composition and prop checks enforce the rules instead of hoping the agent follows them. A skin moves the same pages from grayscale toward mid-fidelity with zero component edits. Each client deploys as an isolated, filtered snapshot.

## Operating Context

- Loop: spec → read registries → compose matched sections → gaps file and stop → approval → draft in the project → validate → filtered deploy → reviewed promotion into the library.
- Specs are Markdown in `projects/<client>/specs/`. Pages are composition-only Astro files in `projects/<client>/pages/`.
- `/_gallery` renders every library example beside its manifest. It is the review surface for promotions and the visual-regression baseline.
- Deploys go to one Cloudflare Pages project per client, with access set to `none`, `basic`, or `access`.

## Capabilities and Constraints

- Astro, DTCG tokens compiled by Style Dictionary, plain scoped CSS, and vanilla JS islands only for simple UI states (tabs, accordions, menus).
- Components and pages may use semantic tokens only. No hex, `rgb()`, `hsl()`, named colors, or `px` lengths. Stylelint enforces this.
- The semantic token set is deliberately small (color, space, type, radius, line, breakpoint). Adding a token is a schema-level change, not a casual edit.
- Component categories are a closed set: layout, header, footer, hero, section, card, form, navigation, placeholder.
- The status lifecycle is draft → stable (via promote) → deprecated (with `replacedBy`).
- `media-placeholder` stands in for all images, maps, video and charts. Copy is real-sounding and short, never lorem ipsum.
- The base skin uses system or bundled fonts only. No remote fonts.
- Not in scope for v1: production code, final visual design, app logic, a CMS, a comment tool, Figma round-tripping, and library version pins.

## Brand Commitments

- Base output stays grayscale low-fidelity, and tokens remain the only styling vocabulary. The base wireframe look itself may be refined: hierarchy, spacing, legibility, clarity.
- Brand expression lives only in skins (`tokens/skins/`), which remap semantic tokens. `harbor` is the existing example.

## Evidence on Hand

- `AI Driven Wireframing Build Spec.md` (Oct 4, 2026) is the normative product spec.
- `projects/acme` ("Acme redesign") and `projects/beta` ("Northwind Supply") look like sample or fixture projects. They are not confirmed real clients.
- The starter library has 10 components (see `library/registry.txt`).
- There are no real client logos, testimonials or content. Do not fabricate any.

## Product Principles

1. Reuse before invention. A variant or prop beats a new component, and new components pass through an approved gap.
2. Mechanical over aspirational. Any rule that can be checked by a script is checked by one.
3. The fidelity dial lives in tokens. Visual change happens in skins and semantic tokens, never in per-page styling.
4. Wireframes communicate structure. Clarity of hierarchy and content beats decoration at base fidelity.
5. Isolation by default. A client build ships only its own pages, and the deployed snapshot is the pin.

## Accessibility & Inclusion

`validate` runs axe basics (labels, heading order) as warnings only. No stricter standard has been set.
