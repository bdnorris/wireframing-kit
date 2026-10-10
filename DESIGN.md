---
name: Wireframer
description: Grayscale, token-only wireframes that read as unfinished on purpose.
colors:
  surface: "#f6f6f4"
  surface-raised: "#ececea"
  surface-highlight: "#dededb"
  text: "#121211"
  text-muted: "#4e4e49"
  border: "#c8c8c4"
  accent: "#3d4f63"
  on-accent: "#f6f6f4"
  placeholder: "#dededb"
typography:
  display:
    fontFamily: "Georgia, \"Iowan Old Style\", Palatino, serif"
    fontSize: "3.25rem"
    fontWeight: 500
    lineHeight: 1.15
  headline:
    fontFamily: "Georgia, \"Iowan Old Style\", Palatino, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
  title:
    fontFamily: "Georgia, \"Iowan Old Style\", Palatino, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  control: "0.25rem"
  card: "0.75rem"
spacing:
  inset: "1rem"
  stack: "1rem"
  gutter: "1.5rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "1rem 1.5rem"
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "1rem"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "1rem"
  media-placeholder:
    backgroundColor: "{colors.placeholder}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "1rem"
    height: "8rem"
  cta-band:
    backgroundColor: "{colors.surface-highlight}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "4rem"
  site-header:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    padding: "1rem 1.5rem"
---

# Design System: Wireframer

## Overview

**Creative North Star: "The Pencil Proof"**

A Wireframer page is a proof, not a final print. It is quiet and plainly provisional, so the people reviewing it argue about structure, hierarchy, and copy instead of color and polish. Everything is gray paper, hairline rules, and crossed boxes. The one slate accent marks the places a visitor would act. If a client looks at a screenshot and asks "is this the final design?", the system has failed.

Every value is a semantic token compiled from `tokens/base.json`. Components never contain a raw color or `px` length, so a skin in `tokens/skins/` can move the same pages toward mid-fidelity without touching a component. This file describes the **base** (unskinned) world. Skins are deliberate departures and are documented by their own token file, not here.

The base can be refined. Better hierarchy, rhythm, and legibility are welcome, but only within grayscale and only through tokens. Refinement must never make a proof look finished.

**Key Characteristics:**
- Warm-neutral gray ramp on a near-white page, with no saturated color except the action accent
- Serif headings (Georgia) over system sans body: an editorial skeleton without bespoke type
- Flat: hairline borders and tonal steps, no shadows
- Crossed-box media placeholders labeled with kind and purpose
- Generous section rhythm (4rem) with a single 1.5rem gutter

## Colors

A warm-neutral gray ramp with exactly one cool slate voice reserved for action.

### Primary
- **Proof Slate** (`accent`): a muted, desaturated blue-slate. It fills the primary action in every component: the `action` chip in heroes and the CTA band, and the submit button in `form-block`. Its text partner is **Paper White** (`on-accent`).

### Neutral
- **Proof Paper** (`surface`): the page background.
- **Raised Sheet** (`surface-raised`): the first tonal step up, used for cards, inputs, the header and footer bars, full-bleed heroes, and the gallery preview frame.
- **Highlight Sheet** (`surface-highlight`): the second step, used for the CTA band and any highlighted tier.
- **Graphite** (`text`): headings, body text, nav links, and labels.
- **Soft Graphite** (`text-muted`): ledes, card bodies, footer text, and the placeholder's kind label.
- **Pencil Rule** (`border`): every hairline, from card edges and input strokes to the header and footer rules and the placeholder's crossing diagonals.
- **Placeholder Fill** (`placeholder`): the inside of `media-placeholder`. It shares Highlight Sheet's value but is a separate token, so a skin can tint media without tinting tiers.

### Named Rules
**The Actions-Only Rule.** Proof Slate means "a visitor would click this," and nothing else. It never colors decoration, section backgrounds, eyebrows, active nav, focus rings, or the annotation overlay. *Incumbent drift:* `library/layouts/Base.astro` currently uses `--accent` for the `:focus-visible` outline and for the annotation overlay's outlines and labels. Those should move to a non-action token (Graphite is the obvious candidate) in a later refinement.

**The No-New-Hue Rule.** The base world has one hue. A second color belongs in a skin, never in `base.json`.

## Typography

**Display Font:** Georgia (with Iowan Old Style, Palatino, serif)
**Body Font:** system-ui (with sans-serif)

**Character:** A bookish serif carries the hierarchy and an anonymous system sans carries everything else. The pairing reads as "manuscript draft" and needs no bundled or remote font.

### Hierarchy
- **Display** (500, 3.25rem, 1.15): the page `h1` in `hero-split` and `hero-centered`, capped at 16ch.
- **Headline** (500, 2.25rem, 1.15): section `h2`s, and the compact-hero `h1`. Capped at 20–22ch where the component sets a measure.
- **Title** (500, 1.5rem, 1.15): card `h3` and the header brand name.
- **Body** (400, 1rem, 1.5): all running text. Ledes cap at 42ch, section bodies at 52ch, and CTA bodies at 46ch.
- **Label** (400, 0.75rem, 0.04em tracking, uppercase): placeholder kind, gallery eyebrows and status, and footer fine print.

### Named Rules
**The Five-Step Rule.** There are five type sizes and no in-between values. If a component needs a new size, it needs a new semantic token, which is a schema change.

## Layout

The content column caps at `breakpoint-lg` (80rem) and is centered. The `landing` layout runs full width, and `app` adds a 1fr / 3fr sidebar grid at `breakpoint-md` (64rem). Sections stack vertically with `space-section` (4rem) block padding and `space-gutter` (1.5rem) inline padding. Inside a section, elements stack at `space-stack` (1rem) and padded boxes use `space-inset` (1rem).

The layout is mobile-first and has one breakpoint in practice. Below `breakpoint-md` everything is one column. At `breakpoint-md` and up, split heroes and media sections go two-up (1fr 1fr), and the feature grid goes three-up. Breakpoints in media queries are written as `var(--breakpoint-*)` and inlined at build time by `src/inline-token-vars.mjs`.

**The Four-Spaces Rule.** Every gap and padding is one of inset, stack, gutter, or section. A component that wants a fifth spacing value is asking for a token change.

## Elevation & Depth

The system is flat. There are no shadows anywhere. Depth comes from tonal stepping (Proof Paper → Raised Sheet → Highlight Sheet) and from 1px Pencil Rule hairlines. The only things drawn above content are the 2px focus outline and, when the overlay is toggled with `A`, the annotation outlines and name tags.

**The Paper-Stack Rule.** If something needs to stand out, raise it one tonal step or give it a hairline border. Never add a shadow.

## Shapes

Two radii: **controls** (0.25rem) for buttons, action chips, and inputs, and **cards** (0.75rem) for cards, placeholders, the CTA band, the app sidebar, and the gallery frame. Borders are always a hairline (1px) of Pencil Rule. The one signature shape is the placeholder's X: two hairline diagonals at ±22° that cross the box and are clipped by its rounded corners.

## Components

### Buttons
Plain and flat, and the only colored thing on the page.
- **Shape:** gently squared corners (`radius-control`, 0.25rem)
- **Primary:** Proof Slate fill, Paper White text, `space-inset` / `space-gutter` padding (1rem 1.5rem), no border
- **Hover / Focus:** no hover treatment yet, which is fine for a non-submitting proof. Focus uses the global 2px outline.
- **Action chip:** heroes and the CTA band render their `action` as a `<p class="action">` with button styling. It shows that an action goes there; it is not a live control.

### Cards / Containers
- **Corner Style:** `radius-card` (0.75rem)
- **Background:** Raised Sheet
- **Shadow Strategy:** none (see Elevation & Depth)
- **Border:** hairline Pencil Rule
- **Internal Padding:** `space-inset` (1rem), with title and body stacked at `space-stack`

### Inputs / Fields
- **Style:** Raised Sheet fill, hairline Pencil Rule stroke, `radius-control`, 1rem inset, inherited font
- **Labels:** the visible label sits above the field and wraps it
- **Focus:** the global 2px outline. There are no error or disabled states, since the form never submits.

### Navigation
The header bar is Raised Sheet with a bottom hairline. The serif brand name is Title-sized on the left, and plain Graphite links with no underline sit on the right, spaced at the gutter. It wraps on narrow screens and has no hamburger. It has no active or hover state yet.

### Media Placeholder (signature)
A Placeholder Fill box with a hairline border, card radius, and a minimum height of two section units (8rem). Two crossing diagonals mark it as media. The centered label states its purpose in Graphite, and an uppercase caption beneath names its kind (image, map, video, chart). Each line of text sits on a fill-colored backing so the X never strikes through it. The element carries `role="img"` and an `aria-label` of the form "kind: label".

### Annotation Overlay
This is kit chrome, not a page component. Pressing `A` outlines every `[data-component]` and pins its registry name in a small caption tag at the top left. (See the Actions-Only Rule above: this currently borrows the accent.)

## Do's and Don'ts

### Do:
- **Do** use only semantic tokens (`--surface`, `--space-gutter`, `--radius-card` …) in components and pages.
- **Do** mark every image, map, video, or chart with `media-placeholder`, labeled with what it will show.
- **Do** separate surfaces with one tonal step or one hairline (1px Pencil Rule).
- **Do** keep text to its measure: 16ch for display, about 20ch for headlines, 42–52ch for body.
- **Do** keep Proof Slate on actions only, roughly one or two per viewport.

### Don't:
- **Don't** add hex, `rgb()`, `hsl()`, named colors, or `px` lengths outside `tokens/`.
- **Don't** add shadows, gradients, or ornament. A proof that looks finished is a failed proof.
- **Don't** introduce a second hue, a remote font, or a sixth type size in the base world. Those belong in a skin or a token change.
- **Don't** use the accent for focus rings, overlay chrome, eyebrows, or active states.
- **Don't** use stock imagery, icons as illustration, or lorem ipsum in place of a placeholder and real-sounding copy.
