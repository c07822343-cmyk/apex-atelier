# Worked example (Demo mode)
This is a compressed but complete run, so the pieces are concrete. The business is fictional.

**Request:** "make a demo for Coastline Garage Doors in Stuart FL, (772) 555-0123, spring repair, openers, hurricane-rated doors, here's their old site: coastline-old.html"

## 1. Facts
A Haiku scout reads the old site's text. `brief.json` (abridged):
```json
{"mode":"demo","business":{"name":"Coastline Garage Doors","trade":"garage door repair","city":"Stuart, FL",
 "phone":{"v":"(772) 555-0123","source":"user"},
 "services":[{"v":"spring repair","source":"user"},{"v":"opener install","source":"user"},{"v":"hurricane-rated doors","source":"user"}],
 "years":{"v":"since 2009","source":"old site footer"},
 "reviews":{"v":null,"source":null},"license":{"v":null,"source":null}},
 "urgency":"emergency","needs":["Google rating + count","license number","real job photos"]}
```

## 2. Direction
The three concepts:
- A: `spring tension tag · light · Archivo Black + Archivo · ledger + poster · safety yellow from springs, steel grey · a tension gauge that fills as you scroll toward "Call"`
- B: `hurricane door rating label · light · Space Grotesk + IBM Plex Sans · spec-sheet frames · ocean blue + warning red · a wind-speed rating stamp`
- C: `dark garage at night · dark · Fraunces + Public Sans · editorial · amber light · garage door opening on scroll`

C is rejected: it's dark with no reason (F2), and a door opening on scroll is a cliché. B is rejected: it matches the last build in history on display face and accent hue. **A is chosen**, because the spring is the thing that actually breaks, and the gauge turns that into a reason to call now.

## 3. Contract (abridged)
| id | job | grammar | acceptance |
|---|---|---|---|
| hero | get the call | poster | `tel:` link in the first 375px screen; H1 "Garage door spring repair in Stuart, usually today"; since-2009 line; [[NEEDS: rating]] chip |
| problems | match the visitor's symptom | ledger | 4 symptom rows → fix → typical time; no prices unless sourced |
| gauge | signature moment | split sticky | gauge works without JS (static 100%); reduced-motion shows the final state |
| hurricane | the differentiator | specimen cards | rated-door options with real model names [[NEEDS]] |
| area | local relevance | map-led | towns actually served, from the brief |
| close | the call again | strip | phone + sms + hours |

## 4–5. Build and scripts
After the first build, `inspect.mjs` returns:
- `[375] mobile header is 96px tall`
- `[375] 2 element(s) cut off at the right edge, e.g. "Port St. Lucie"`

Both are fixed with two exact-match edits: drop the tagline under the logo on mobile, and wrap the town list. The re-run is clean.

## 6. Gauntlet, round 1
Three critics in one message. Their replies (abridged):
```json
{"lens":"conversion","score":7,"one_line":"Sticky call bar covers the last FAQ answer","blockers":[],"fixes":[{"where":"footer","change":"add padding-bottom equal to the call bar height (72px) on mobile","why":"content hidden behind the bar"}]}
{"lens":"brand","score":8,"one_line":"Gauge is strong; problems ledger still feels generic","blockers":[],"fixes":[{"where":"#problems","change":"print rows like the spring's tension tag: punched hole, part number style labels","why":"carry the artifact past the hero"}]}
{"lens":"craft","score":8,"one_line":"Hero subline line-length too long at 1280","blockers":[],"fixes":[{"where":"#hero p","change":"max-inline-size: 38ch","why":"measure"}]}
```
The Director merges and applies the 3 fixes, re-runs the scripts, then sends one **new** conversion critic, which scores 9. Done in 2 rounds.

## 7. Hand-off
Append to history:
`{"client":"Coastline Garage Doors","bg":"light","display":"Archivo Black","headline_device":"tension tag label","grammar":["poster","ledger"],"accent_hue":95,"artifact":"spring tension tag"}`

Reply to the user:
> Built the Coastline demo (`index.html`, 410KB). Concept: the spring tension tag, with a gauge that fills toward "Call". Critics: conversion 9, brand 8, craft 8 after 2 rounds. Still needed from the client: Google rating and count, licence number, job photos. Placeholders are marked on the page. [mobile-01.png] [desktop-01.png] [desktop-03.png]
