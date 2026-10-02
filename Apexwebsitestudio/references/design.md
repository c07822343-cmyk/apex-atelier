# Design reference
Contents: 1 Concepts and the borrowed artifact · 2 Type pairings · 3 Layout grammars · 4 Colour · 5 Space and rhythm · 6 Motion · 7 Images · 8 Modern CSS · 9 Single-file structure

## 1. Concepts and the borrowed artifact
A template is what you get when no decision was specific to this business. The cheapest way to force specific decisions is to borrow a real object from the trade or the place, then let it dictate typography, layout and one interaction.

| Trade | Artifacts worth borrowing |
|---|---|
| Pest / termite | inspection report with stamped findings · specimen card · treated-zone site plan · warranty certificate |
| HVAC | thermostat dial · equipment nameplate/SEER label · duct schematic · service tag on the air handler |
| Plumbing | pipe-fitting catalogue · pressure gauge · water-heater rating plate |
| Roofing | wind-mitigation form · shingle spec sheet · storm-tracking cone |
| CPA / bookkeeping | ledger paper · tax calendar · tabbed client folder · footnoted statement |
| Low-voltage / IT | patch-panel labels · rack elevation · signal path diagram |
| Pool / landscaping | tile sample board · plant tag · water-chemistry strip |
| Dental / med spa | appointment card · treatment menu · before/after consent sheet |
| Cleaning | checklist card · room-by-room schedule |
| Any local business | the street sign, the van wrap, the local newspaper's classifieds, the town's tide chart |

Write a concept as one line: `artifact · light/dark · display + text face · grammar · palette source · signature moment`. Example: `wind-mitigation form · light · Fraunces + Public Sans · ruled form fields as section frames · storm-cloud grey + safety orange from the van · a "hurricane rating" stamp that presses onto the hero on load`.

**Signature moment:** exactly one memorable interaction or visual. It should come from the artifact and point toward the call. Good ones: a dial that scrubs with scroll to show the temperature drop; a stamp landing on the "Inspection passed" card; a before/after slider of the client's real job; a service-area map drawn in the brand's line style; a review quote set at poster scale. Things that aren't signature moments: particles, a parallax hero, fading in every element.

## 2. Type pairings
Choose a display face with character and a quiet text face, with at most 4 weights in total. All of these are on Google Fonts. Rotate through them and check the history file so builds don't converge on one favourite.

| Feel | Display | Text |
|---|---|---|
| Honest trade, sturdy | Archivo Black / Archivo Expanded | Archivo |
| Local institution, warm serif | Fraunces | Public Sans |
| Engineering, precise | Space Grotesk | IBM Plex Sans |
| Editorial, calm authority (CPA, legal) | Newsreader | Source Sans 3 |
| Friendly family business | Bricolage Grotesque | Nunito Sans |
| Retro Florida / signage | Shrikhand or Righteous (headlines only) | Karla |
| Industrial, condensed | Oswald or Barlow Condensed | Barlow |
| Clinical-clean (dental, med) | Manrope | Manrope |
| Hand-made, craft | DM Serif Display | DM Sans |
| Bold modern | Unbounded (short headlines only) | Figtree |

Defaults to avoid, because they read as "AI made this": Inter or Roboto alone, Poppins, Montserrat with Open Sans, and Playfair with italic accent words. ApexWeb's own pairing (Inter Tight, Instrument Serif and JetBrains Mono) is reserved for apexweb itself.

Use a fluid scale: `clamp(min, calc(rem + vw), max)`, built on a 320→1240px viewport range, a 16→19px base and a 1.2→1.28 ratio. Display text gets line-height 1.0–1.1, slightly negative tracking and `text-wrap: balance`. Body text gets 1.5–1.65 line-height, a 60–70ch measure and `text-wrap: pretty`. Preload the display font file and use `font-display: swap`.

## 3. Layout grammars
No two adjacent sections should share a grammar. Pick from these, or invent new ones from the artifact. A grammar can be used at most twice per page, never side by side:
- **Poster:** one statement at 12–18vw with a single supporting line. Use it for the emotional peak.
- **Split sticky:** a pinned headline on one side while proof scrolls past on the other.
- **Ledger / form:** ruled rows with label columns. Good for services, pricing and process.
- **Specimen cards:** asymmetric cards of different sizes with real photos, captioned like a field guide.
- **Editorial:** 2–3 text columns, a pull quote and a drop cap. Use it for the about or story section.
- **Map-led:** the service area as the actual layout, with towns as anchors.
- **Proof wall:** reviews as a dense masonry of real quotes, with name and town.
- **Strip:** a full-bleed horizontal band, for trust badges or a guarantee.
- **Ticket/receipt:** a narrow column. Good for a quote form or an offer.
Bento grids and three equal cards are the template look. Use them at most once, and only if the content really is three equal things.

## 4. Colour
- **Derive, don't choose:** take the palette from the subject — the van wrap, the uniforms, the local light, the material the trade works with. Home services in Florida usually want light backgrounds (bright sun, families, trust). Dark backgrounds need a stated reason. Also avoid the stock trade palettes: navy + red + cream ("patriotic contractor") and blue + orange ("generic HVAC"). Critics fail them on the swap test unless they really are the client's own colours.
- **Tokens:** write them in OKLCH on `:root`, for example `--bg: oklch(97% 0.01 85)`. Keep hue and chroma fixed and step lightness for ramps. Tint neutrals toward the brand hue (chroma 0.005–0.02); pure grey looks unfinished. Use one accent and spend it on the CTA and the signature moment. Derive hover and active states with `color-mix(in oklch, var(--accent), black 12%)`.
- **Contrast:** body text needs ≥ 4.5:1, large text and UI ≥ 3:1. Text over photos needs a scrim or a solid panel, measured by `inspect.mjs` (axe).

## 5. Space and rhythm
- Use one spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px, as fluid tokens.
- Section padding is `clamp(4rem, 9vw, 8rem)`. Use asymmetry on purpose, for example a 7/5 split rather than 6/6.
- Whitespace is what makes a site feel expensive, and cramming is what makes it feel cheap.
- Mobile isn't the desktop layout stacked. Recompose the hero for a thumb: headline, one line of proof, then the call button, all within the first 600px.

## 6. Motion
- Animate transform and opacity only.
- Easing is `cubic-bezier(.2,.7,.2,1)`. UI transitions take 180–300ms; reveals take 500–800ms.
- Have one orchestrated entrance on load. Scroll reveals are for at most three key moments, not every element.
- Under `@media (prefers-reduced-motion: reduce)`, crossfade or show the final state.
- Prefer CSS scroll-driven animation (`animation-timeline: view()` inside `@supports`) to JS scroll listeners. Load GSAP only for a complex signature timeline, and use `defer` when you do.

## 7. Images
- **Real photos:** of the client's jobs, team and trucks. They beat any stock or generated image.
- **No photos:** design typographically, or with illustration built from the artifact (line drawings, stamps, diagrams). Don't fake job photos.
- **Markup:** use `<picture>` with AVIF/WebP/JPEG, `srcset` and `sizes`, and width/height on every image.
- **Hero image:** `fetchpriority="high"` and never lazy-loaded. Everything else gets `loading="lazy" decoding="async"`.
- **Processing:** run them through `scripts/assets.sh`.

## 8. Modern CSS worth using (2026)
- **Safe everywhere:** container queries, `:has()`, `clamp()`, `color-mix()`, OKLCH, `text-wrap: balance/pretty`, `@starting-style` (for dialog and popover entry), `dvh` units.
- **Progressive enhancement, behind a feature check:** scroll-driven animations (`@supports (animation-timeline: view())`), View Transitions (`if (document.startViewTransition)`), anchor positioning.

## 9. Single-file demo structure
1. `<head>`: meta, preloads and JSON-LD.
2. `<style>`: tokens on `:root`, then base styles, then one block per section.
3. `<body>`: a skip link, the header, then `<main>` with one `<section id>` per contract row, each preceded by `<!-- §id -->`.
4. The footer, then one deferred `<script>`.

Keep inline images under about 30KB each and put larger ones in `img/`. The whole first load should stay under 1MB.
