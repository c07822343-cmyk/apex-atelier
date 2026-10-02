# Failure gallery
These are ten ways earlier ApexWeb builds failed, taken from real screenshots. Critics treat any repeat as a blocker. The check column shows which script catches each one automatically, so the critics can spend their attention on the rest.

| # | Failure | What it looked like | Rule | Caught by |
|---|---|---|---|---|
| F1 | **House-style bleed** | Pest, HVAC and CPA sites all came out as dark backgrounds with a serif H1, one *italic accent word* and mono eyebrows. That's ApexWeb's own look, so they read as one site in different colours. | Client DNA differs from ApexWeb and from the last 3 builds on background, display face, headline device and grammar. | audit.py (fonts and italic-in-H1), history check, brand critic |
| F2 | **Dark by default** | All four were dark, including a family pest company in sunny Tampa. | Light vs dark comes from the subject. Dark needs a reason written in `dna.json`. | brand critic |
| F3 | **Empty boxes** | Black video frames and big panels with one line of text in them. | No media slot without media. Without an asset, redesign the section. | inspect.mjs (empty box) |
| F4 | **Grandiose copy** | "Absolute Climate Mastery for South Florida Estates." | H1 = service + place in plain words. See `copy.md`. | audit.py (banned words), conversion critic |
| F5 | **Mobile header collapse** | Wordmark wrapped to 4 lines, a pill overlapping the CTA, the hamburger touching the button. Headers ran 151–176px tall. | Mobile header: logo, call icon and menu on one line, ≤ 72px. | inspect.mjs (header height, overlap, wraps) |
| F6 | **Page wider than the phone** | The HVAC page was 735px wide on a 375px screen, with the nav and cards cut off. The carousel cards were clipped. | No content past the viewport edge. Carousels need controls and a visible partial card. | inspect.mjs (overflow, clipped elements) |
| F7 | **Centred walls of text / buried phone** | A 6-line centred paragraph under the H1, and no `tel:` link anywhere on the CPA site. | Left-aligned body copy, a subline of 20 words or fewer, and the call in the first mobile screen. | inspect.mjs (centred paragraph, tel checks) |
| F8 | **Text over busy photos** | Headlines over palm fronds. | Use a scrim or a solid panel, and keep contrast ≥ 4.5:1. | inspect.mjs (axe color-contrast), craft critic |
| F9 | **One grammar, repeated** | Dark band, small heading, two boxes, repeated for 12 screens. | Neighbouring sections must differ, and the homepage is ≤ about 7 desktop screens. | inspect.mjs (height), craft critic |
| F10 | **Weight** | A 2.4MB single file, with 2MB of inlined base64 images. Two `<h1>` per page. | First load < 1MB, exactly one h1, large images external. | audit.py, inspect.mjs, slice.py blobs |

## History file: `~/.apex-atelier/history.json`
A JSON array with one entry per finished build:
```json
{"client":"Coastline Garage Doors","date":"2026-10-03","bg":"light","display":"Archivo Black","text":"Archivo","headline_device":"stamped label","grammar":["poster","ledger","specimen","map"],"accent_hue":45,"artifact":"spring tension tag"}
```
Before choosing a concept, read the last 3 entries. If a concept matches any one of them on 2 or more of these traits, reject it: `bg`, `display`, `headline_device`, the first two `grammar` entries, and `accent_hue` within ±20°. Create the file if it doesn't exist. Keeping it in the home directory means it carries across projects.
