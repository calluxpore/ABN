---
name: Anadhya Badri Narayan
description: The portfolio as a Bengaluru card shop's sample album; beige linen cover, white pages, a fore-edge of tabs.
colors:
  linen-cover: "#ddd3c4"
  linen-deep: "#cfc3b2"
  charcoal-ink: "#2b2926"
  charcoal-soft: "#534d46"
  charcoal-press: "#45413b"
  album-white: "#ffffff"
  paper-warm: "#f4f1ec"
  foil-cream: "#faf8f4"
  hairline: "#e6e0d6"
  tab-pale-beige: "#ece6dc"
  tab-warm-grey: "#6b665f"
typography:
  display:
    fontFamily: "Rozha One, Bodoni Moda, serif"
    fontSize: "clamp(3.25rem, 1.6rem + 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Rozha One, Bodoni Moda, serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Rozha One, Bodoni Moda, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Hind, Mukta, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Hind, Mukta, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hind, Mukta, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  sm: "12px"
  page: "clamp(16px, 1.6vw, 24px)"
spacing:
  margin: "clamp(16px, 3vw, 40px)"
  gap: "clamp(16px, 2vw, 28px)"
  sheet-pad: "clamp(28px, 4vw, 64px)"
  album-pad: "clamp(56px, 8vw, 112px)"
  rail: "clamp(280px, 26vw, 380px)"
components:
  button-primary:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.foil-cream}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.charcoal-press}"
  button-ink:
    backgroundColor: "{colors.charcoal-ink}"
    textColor: "{colors.album-white}"
    rounded: "{rounded.sm}"
    padding: "0 22px"
    height: "48px"
  tab-stationery:
    backgroundColor: "{colors.album-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "46px"
  tab-illustration:
    backgroundColor: "{colors.tab-pale-beige}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "46px"
  tab-industrial:
    backgroundColor: "{colors.tab-warm-grey}"
    textColor: "{colors.foil-cream}"
    rounded: "{rounded.sm}"
    padding: "8px 18px"
    height: "46px"
  page-sheet:
    backgroundColor: "{colors.album-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.page}"
    padding: "{spacing.sheet-pad}"
  inset-panel:
    backgroundColor: "{colors.paper-warm}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.page}"
    padding: "clamp(24px, 3vw, 40px)"
  back-cover:
    backgroundColor: "{colors.linen-deep}"
    textColor: "{colors.charcoal-ink}"
    padding: "clamp(56px, 8vw, 112px) clamp(16px, 3vw, 40px) 28px"
---

# Design System: Anadhya Badri Narayan

## Overview

**Creative North Star: "The Card Shop Sample Album"**

The site is the thick sample album a Bengaluru card shop hands you across the counter. A beige linen cover holds everything. White album pages sit on it, one design per page. A fore-edge of tabs down the right side is the index and the navigation on every page. The interface is bound in neutrals so the printed work is the only colour.

Density is calm and generous. Each page is a rounded white sheet with wide inner margins, set on linen that shows around it. Type is stamped rather than styled: one heavy Devanagari-born serif (Rozha One) for anything announced, one plain humanist sans (Hind) for everything read. Depth comes from paper on linen and from tone, not from shadow. Motion is physical and short: tabs slide out of the fore-edge, pages lift into place as they scroll in, and a held picture tilts a degree or two as if it were set down by hand. Under a mouse or trackpad, every picture tilts in 3D toward the pointer (up to 9 degrees on each axis, scaled to 1.025) while the image inside drifts up to 10px the other way for depth; it eases back flat over 600ms when the pointer leaves. There is no glare layer, because the system has no gradients. Touch screens and reduced-motion visitors get the still picture. The tab-rail previews and the video are excluded.

The confirmed rejections are the visitor's: nothing that reads as a template thumbnail grid, nothing dark, nothing over-decorated, and the CV never hidden.

**Key Characteristics:**
- Beige linen ground, white rounded album pages, warm charcoal ink.
- Neutral palette only; every hue on screen belongs to a photograph of her work.
- Every corner rounded: pictures, page sheets, tabs, buttons, inset panels, the footer's top edge.
- A fore-edge tab rail, coded by discipline, as the index on every page.
- Rozha One stamped display over Hind text.
- Flat at rest: no gradients, and no shadows except the one cast by a picture while it tilts under the pointer (user pinned).

## Colors

A warm, quiet set of beiges, whites and charcoal greys, with no accent hue at all.

### Primary
- **Charcoal Ink** (`charcoal-ink`): the single voice. Body text, display headings stamped on the cover, filled buttons, the focus ring, text selection, and the current tab on the phone strip.
- **Charcoal Press** (`charcoal-press`): the hover state of every filled button. Never used at rest.

### Neutral
- **Linen Cover** (`linen-cover`): the ground of the whole site: top bar, cover, the margin around every album page, the tab rail.
- **Linen Deep** (`linen-deep`): the back cover (footer) and the scrollbar track; one step darker so the album visibly closes.
- **Album White** (`album-white`): page sheets, stationery tabs, text on ink buttons.
- **Paper Warm** (`paper-warm`): inset panels inside a page (motif lists, the closing "ask" panel) and the placeholder behind every picture while it loads.
- **Foil Cream** (`foil-cream`): text on charcoal buttons and on warm-grey industrial tabs.
- **Charcoal Soft** (`charcoal-soft`): secondary text: the motto on the cover, fact labels, dates, captions, imprint.
- **Hairline** (`hairline`): the only rule in the system, a 1px divider between roles on the About page.
- **Tab Pale Beige** (`tab-pale-beige`) and **Tab Warm Grey** (`tab-warm-grey`): discipline codes on the tab rail, alongside Album White.

### Named Rules
**The Colour Belongs To Her Work Rule.** The interface uses only beige, white and warm grey. Every saturated hue on a page must come from a photograph of a printed piece. This is a binding brand commitment pinned by the user; no accent colour, tinted button, or coloured link is ever added.

**The Discipline Tab Rule.** Tab colour encodes discipline and nothing else: white for stationery, pale beige for illustration, warm grey with cream text for industrial design.

### Dark mode
The same album bound in charcoal, still neutrals only. `:root[data-theme="dark"]` swaps the same tokens: cover #1f1d1b, back cover #171614, pages #2a2825, insets #34312d, text #ece7df, secondary text #b8b0a5, hairline #3d3a35, tabs #2a2825 / #3b3732 / #5a554d, button press #d6cfc4, picture edge at 10% bone. Buttons invert to bone fill with charcoal text. Every text pair stays at or above 6:1. The visitor's choice is stored in `localStorage` (`me-portfolio-theme`); with no choice the device's `prefers-color-scheme` decides, and an inline script in `<head>` sets the theme before first paint.

## Typography

**Display Font:** Rozha One (with Bodoni Moda, serif)
**Body Font:** Hind (with Mukta, system-ui, sans-serif)

**Character:** Rozha One is heavy and high-contrast, like a name stamped into a card shop's album cover; Hind is plain, warm and Indian-designed, and does all the reading. Weights in use are Rozha 400 and Hind 400, 500 and 600.

### Hierarchy
- **Display** (Rozha One 400, `typography.display`, line-height 0.98): the name on the cover (max 8.5ch) and the back-cover sign-off. Twice per page at most.
- **Headline** (Rozha One 400, `typography.headline`, 1.04): album section titles, spread titles, case-study section titles. Case page titles use a slightly smaller clamp (2.25rem to 3.5rem). Headings are balanced (`text-wrap: balance`).
- **Title** (Rozha One 400, 1.5rem): titles of the smaller pieces mounted beside a lead plate.
- **Lead** (Hind 400, `typography.lead`, 1.4 to 1.45): the role line under the name, ledes, case-study intros, the first paragraph on About. Max 34 to 52ch.
- **Body** (Hind 400, 1.125rem, 1.6): running text, max 46ch on album pages. Captions and motif notes drop to 1rem in Charcoal Soft.
- **Label** (Hind 600, 0.9375rem): buttons, nav links (500), tab names (600, 1rem), fact labels, dates. Sentence case; never uppercase or tracked out.

### Named Rules
**The Two Faces Rule.** Rozha One announces, Hind is read. Plate and motif headings inside a page are Hind 600 at body size, not display, so the album pages stay quiet beneath their single stamped title.

## Layout

The page is a two-column album: content on the left, the tab rail (`spacing.rail`) on the right. On the home page the cover fills the first viewport (100svh minus the top bar) with the name and role top-left, the newest suite as a tilted rounded picture in the cover's window, and the rail of every project down the right edge. On case pages the rail stays sticky at the right with the current tab pulled out.

Inside album pages, a 12-column grid with `spacing.gap` gutters. Spreads alternate picture and text sides (picture spans 6 columns, text 5, one column of air between). Discipline pages mount a lead plate across 7 columns with two smaller pieces stacked in the remaining 5. Case-study plates run in 2 to 5 columns and switch to a 12-column span system above 1101px. Sheets carry `spacing.sheet-pad` inner padding; album sections carry `spacing.album-pad` vertically and `spacing.margin` horizontally; consecutive sheets stack with a 20 to 32px gap of linen.

Responsive: below 1180px the hover peek is replaced by a static tilted window picture; below 1100px lead plates go full width; below 900px everything collapses to one column, the cover rail stacks under the cover, and on case pages the rail becomes a horizontal scrolling strip of tabs above the page with the current tab filled in charcoal; below 560px sheet padding drops to 20px and plates go single column.

## Elevation & Depth

The system is flat at rest. There are no gradients anywhere, and only one shadow: a picture lifted by the pointer casts one (user pinned, see below). Depth is conveyed by material and tone: white paper sheets on beige linen, Paper Warm panels inset within a white page, and a darker linen back cover that closes the album. The only sense of lift is motion (a page rising 40px as it enters, a tab sliding out) and a slight 1.5 to 2 degree tilt on the cover's held picture.

### Named Rules
**The Paper On Linen Rule.** Separation is always a change of surface (linen, white, warm paper), never a drop shadow or a border box.

**The Lifted Card Rule.** The one shadow in the system belongs to a picture while it tilts toward the pointer. It is two layers cast away from the pointer, as if lit from above the visitor: a tight contact shadow (14px blur, -6px spread, `--lift-near`) and a wide soft one (48px blur, -14px spread, `--lift-far`), with offsets that follow the tilt. Light theme: Charcoal Ink at 18% and 26%. Dark theme: black at 45% and 70%, so it still separates from charcoal pages. It fades in over 140ms and out over 600ms with the tilt. Nothing at rest carries a shadow. The only drawn line is the 1px Hairline between list rows.

## Shapes

Every corner is rounded; this is a binding brand commitment pinned by the user. Two radii do all the work: `rounded.page` (16 to 24px, fluid) for pictures, page sheets, inset panels, videos and the top edge of the back cover; `rounded.sm` (12px) for buttons, tabs and the skip link. Pictures are always mounted in a rounded, clipped holder, with a Paper Warm fill showing while they load and a faint 1px inner outline (Charcoal Ink at 12%) so the rounded corner still reads when the artwork itself is white. The back cover rounds only its top two corners, so the footer reads as the album's back board rising under the last page. Arrows and icons are drawn inline as 1.8px-stroke SVG.

### Named Rules
**The No Square Corner Rule.** No image, sheet, tab, button, panel or footer edge ships with a square corner. A new element picks `rounded.page` if it holds work or content and `rounded.sm` if it is a control.

## Components

### Buttons
Solid, small and plain: a charcoal label you can always find.
- **Shape:** gently rounded (`rounded.sm`, 12px), min-height 48px, 22px side padding, optional 16px inline SVG icon with a 10px gap.
- **Primary:** Charcoal Ink fill, Foil Cream text, Hind 600 at label size. The CV download is always this button, in the top bar, on the cover, on About and in the footer.
- **Ink variant:** the same charcoal fill with Album White text, used on white pages.
- **Hover / Active / Focus:** fill shifts to Charcoal Press over 180ms; pressing nudges it down 1px; focus shows a 3px charcoal outline offset 3px.
- **Text link:** Hind 600, underlined at 0.24em offset; on hover the underline drops to 0.4em. The "go" link pairs this with an arrow SVG that slides 5px right on hover.

### Tabs (signature component)
The fore-edge of the album and the site's index.
- **Shape:** `rounded.sm`, min-height 46px, 8px by 18px padding; name left (Hind 600, 1rem), year or count right (0.875rem).
- **Colour:** by discipline (see The Discipline Tab Rule).
- **Behaviour:** on hover, focus or current page the tab slides 22px out of the fore-edge (8px on small screens) over 320ms. On the home cover a hovered or focused tab swaps its own picture into the cover's window, tilted; with nothing pointed, the newest suite rests there. On load, cover tabs slide in from the right, staggered 40ms apart.
- **Phone strip:** on case pages under 900px, tabs become a horizontal scroll strip, the meta drops away, and the current tab lifts 4px and fills Charcoal Ink with white text.

### Cards / Containers
- **Page sheet:** Album White, `rounded.page`, clipped, `spacing.sheet-pad` padding. Holds a spread, a discipline page, About, or a whole case study.
- **Inset panel:** Paper Warm, `rounded.page`, 24 to 40px padding, inside a page sheet. Used for motif lists and the closing "ask" panel with its call to action.
- **Back cover:** Linen Deep, top corners rounded, display-size sign-off left, email, LinkedIn and CV button right.

### Navigation
Top bar on linen: the ABN mark in Rozha One 1.75rem with her full name beside it (hidden under 900px); Work, About and LinkedIn in Hind 500 at label size; the CV button, then the light/dark switch (a 48px rounded square with a sun or moon line icon, `aria-pressed` reflecting dark mode) at the far right. LinkedIn leaves the bar under 420px; it stays on the cover and in the footer. Links underline with a 2px charcoal bar that scales in from the left over 240ms; the current page keeps it.

### Facts list
A two-column definition list at label size: Charcoal Soft terms, Hind 500 values, 4px by 20px gaps. Used for what, where, scope and dates on every spread and case head.

## Do's and Don'ts

### Do:
- **Do** keep the interface to beige, white and warm grey, and let photographs of her printed work carry all colour.
- **Do** round every picture, sheet, tab, button, panel and the footer's top edge, using `rounded.page` (16 to 24px) for content and `rounded.sm` (12px) for controls.
- **Do** separate surfaces with paper on linen and Paper Warm insets, not lines or shadows; the tilting picture's shadow is the only exception.
- **Do** use Rozha One only for stamped titles and Hind for everything read, with Hind 600 at body size for headings inside a page.
- **Do** keep the CV button in Charcoal Ink and present in the top bar of every page.
- **Do** colour tabs strictly by discipline and keep the tab rail as the index on every page.
- **Do** honour reduced motion: pages and tabs appear at rest, and autoplay video is paused.

### Don't:
- **Don't** add an accent hue, tinted button, coloured link or coloured background to the interface.
- **Don't** ship any element with square corners.
- **Don't** use gradients, or put a box shadow on anything at rest.
- **Don't** lay work out as a uniform white thumbnail grid; mount it as spreads and lead plates on album pages.
- **Don't** go dark: no charcoal page grounds or dark mode sections.
- **Don't** uppercase or letter-space labels; they are sentence case Hind.
