# Local-service conversion and SEO
Sources (agency data, treat as directional): webtonic, rebolthq, pipelineon, foundrycro, thestacc, corewebvitals.io, brightlocal, SEJ.
## Above the fold (all required)
H1 = service + city · tap-to-call number · primary CTA · Google stars + review count · licence/insured line · one specific guarantee ("2-year workmanship warranty", not "satisfaction guaranteed").
## Calls
Calls are about 60–70% of trade conversions. Use a sticky mobile call bar with `tel:` and an `sms:` option. Keep the real NAP number in the HTML and schema; tracking numbers only via dynamic swap.
## Trust
Licence numbers and certifications (EPA, NATE, BICSI, CPA) near the top, not only in the footer. Real reviews with first name and city. Real job photos. Years in business, only if sourced.
## Forms
3–5 fields: name, phone (required), service, message; email optional. Use `autocomplete` and `inputmode`. Promise a reply time. Send to a thank-you page (for conversion tracking). Emergency trades lead with the call; planned services lead with the form.
## Service-area pages
Only for areas actually served. Each needs unique local content: a job there, neighborhoods, local issues (humidity, termites, hurricane code), a local review. Swapping the city name in identical copy is a doorway page and gets penalized. Prefer a hub page plus a few deep pages.
## Schema (JSON-LD)
Use the most specific type: `HVACBusiness`, `Plumber`, `Electrician`, `GeneralContractor`, `AccountingService`. Pest control has none, so use `HomeAndConstructionBusiness`. Fields: name, url, telephone, address, geo, openingHoursSpecification, image, priceRange, sameAs (GBP), areaServed, hasOfferCatalog. Use `FAQPage` only for FAQs visible on the page. Use `aggregateRating` only with real first-party reviews. Everything must match the GBP exactly.
## AI search
Google says llms.txt does nothing (June 2026), so skip it. What helps: question headings each answered in 40–60 words directly below, honest price ranges, server-rendered HTML, consistent facts across the web, and don't block AI crawlers.
## Core Web Vitals (p75 field data)
LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1. Avoid heavy chat or booking widgets above the fold; load them on interaction.

## Lessons from trials (Oct 2026)
- **One call button visible at a time.** The mobile header gets a phone *icon*. The hero gets the full Call button. The sticky call bar slides in only after the hero button leaves the screen (IntersectionObserver plus a class toggle; it should simply be present when reduced motion is on). Three red Call buttons on one screen reads as an ad wall.
- **Missing facts in a demo.** Keep `[[NEEDS]]` out of the first screen: omit the rating chip rather than showing a placeholder there. Lower on the page, render placeholders as quiet chips, e.g. `.needs{font:500 .8rem/1.2 var(--font-text);border:1px dashed currentColor;opacity:.6;padding:.1em .4em;border-radius:4px}`. A loud red placeholder in a sales demo looks broken.
- **Demo forms.** Without a real endpoint, use `action="mailto:"` with the client's email if it's known. Otherwise show a small "Demo form, connects at launch" note next to the submit button. Never show a fake "We'll call you back" success message.
- **Promise next to the action.** Put a reply-time line directly beside the submit button and under the hero Call button, sourced or `[[NEEDS]]`.
