# Asset pipeline
Assets decide whether a site looks premium or templated. Handle them before design starts.

## 1. Inventory (scout, Haiku)
List every asset the client has: logo files, job photos, team photos, trucks, certifications, reviews screenshots. Write it to `.atelier/assets.json` as `{file, kind, w, h, usable:true|false, why}`. Use `sips -g pixelWidth -g pixelHeight` (macOS) or `identify`; don't open images just to read their dimensions.

## 2. Gap plan
For each section in the contract, record: real asset → use it. No asset → (a) redesign the section to be typographic or illustrative, (b) ask the client (log a `[[NEEDS: photo of …]]`), or (c) generate one. Never leave an empty box (failure-gallery F3).

## 3. Generated imagery rules
Generate only environments, textures and details. Never generate fake staff, fake job photos presented as real, fake reviews or fake logos. Label generated hero scenes internally in `assets.json`. Match the local light (South Florida: hard sun, high-key, teal/sand), not moody studio light.

## 4. Processing (script, 0 tokens)
`scripts/assets.sh <src_dir> <out_dir>` makes AVIF and WebP at 640/1024/1600/2400 widths plus a JPEG fallback and prints the `<picture>` markup. Hero source ≥ 2400px wide. Logos become SVG where possible; otherwise PNG @2x, trimmed.

## 5. Screenshots for the portfolio and promo
After launch, `node scripts/inspect.mjs <url> --shots` captures the mobile and desktop tours plus 768 and 1920 frames. Portfolio shots are 1920×1080 frames of the hero, not full-page strips. Mobile shots are 1290×2796 (iPhone Pro). Store them in `promo-assets/` named `work-NN-client.png`.

## 6. Token rule
To look at an image, downscale it first (`sips -Z 900 in.png --out /tmp/x.jpg`). A full 1440×9787 strip costs far more tokens and shows less.
