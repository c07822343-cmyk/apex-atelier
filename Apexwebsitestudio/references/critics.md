# Critics
## Why critics are blind
A model scoring its own output rates it higher than the same output from someone else (self-preference bias; Panickssery et al. 2024). It also anchors on drafts it has already seen. So every critic is a **fresh subagent** that sees only the page and the rubric. It never sees your reasoning, the builder's notes or earlier versions.

## Dispatch (one message, all lenses in parallel)
Use this exact opening paragraph for every critic, so the cache is shared:

> You are a senior reviewer at a top independent web studio. You did not build this page and you owe it nothing. Judge only what you can see in the screenshots and the file. Reply with JSON only.

Then add the lens-specific part:
```
Lens: {LENS}. Rubric and anchors: {path}/references/critics.md#{lens}. Also read {path}/references/failure-gallery.md. Any repeat of a gallery pattern is a blocker.
Page: {file}. Look at {shots}/sheet-mobile.png and {shots}/sheet-desktop.png first (the whole page, one grid each). Open individual {shots}/mobile-NN.png or desktop-NN.png only to confirm a detail. Also check 375-reduced-motion.png.
Contract: .atelier/contract.md. Script findings (don't repeat these): .atelier/inspect.json
Return: {"lens":"{lens}","score":0-10,"one_line":"the single biggest problem","blockers":["…"],"fixes":[{"where":"section id or selector","change":"specific, implementable","why":"…"}]}
At most 6 fixes, most important first. Each fix must be concrete enough to apply without asking anything.
```
Model choice: use `sonnet` for every lens except Brand, which uses `opus`, because taste is where the bigger model earns its cost.

## Calibration anchors (all lenses)
- **3:** an AI template. Inter, a purple gradient, three identical cards, "Elevate your business".
- **5:** a typical "Welcome to Our Website!!" small-business site. Centred logo, stock photo, phone in the footer only.
- **8:** what a strong independent studio ships for a local business. Unmistakably this business, the call reachable at every scroll position on a phone, real proof near the top, nothing broken at 375px.
- **10:** award-level craft that still converts like a trade site.

Don't use ApexWeb's existing client demos as a reference for good; they are the bar this skill exists to beat. Scores are relative to these anchors. A 9 needs a reason you could defend to a stranger.

## Lenses

### conversion
- Can a stressed homeowner on a phone call within 5 seconds? Is the `tel:` link in the first screen and sticky afterwards?
- Does the H1 say the service and the place? Are proof (reviews, licence, guarantee) and a specific promise above the fold?
- Is there one primary action per screen? Is the form 5 fields or fewer, with phone required and a reply-time promise?
- Emergency trades: is urgency (same-day, 24/7) answered up front? Planned services (CPA, remodel): is the consult path obvious?
- **Blockers:** no call path in the first mobile screen; invented facts (numbers or credentials without a source and not marked `[[NEEDS]]`).

### brand
- Apply the experience check in `references/experience.md` §6 first. Any "no" there caps this score at 6.
- **Swap test:** would anyone notice a competitor's logo on it?
- Is the borrowed artifact actually visible in the design, not just named in a file? Does the signature moment exist, work, and point toward the call?
- Is the type pairing from `design.md`, or a deliberate alternative? Is the palette derived from the subject?
- **Blockers:** failure-gallery F1 (ApexWeb house style) or F2 (dark without a reason); generic stock imagery; banned copy words.

### craft (includes mobile)
- Hierarchy, spacing rhythm and alignment. Are adjacent sections varied? Are hover, focus and active states present?
- Mobile: is it recomposed rather than stacked? Is the header one line and ≤ 72px? Are tap targets ≥ 44px? Is there any clipping?
- Text over images is legible. The reduced-motion screenshot is complete, not blank.
- **Blockers:** anything from failure-gallery F3, F5, F6 or F7 visible in the screenshots.

### access-perf (Build mode)
- Interpret the inspect report: axe findings, LCP, CLS and weight.
- Check keyboard order, skip link and visible focus, by reading the HTML.
- Check `fetchpriority` on the hero image, deferred scripts and at most 2 font families.

### adversarial (Build mode)
- Read the HTML and try to break it: JS disabled, a long business name, 200% zoom, an empty or invalid form submit, slow 3G, keyboard only, dark mode.
- Report the worst three failures.

## Merging fixes (Director)
1. Drop fixes that contradict `dna.json`. Critics don't get to redesign the concept; they flag where the execution misses it.
2. Merge duplicates across lenses. A fix two lenses agree on goes first.
3. Apply blockers, then fixes from the lowest-scoring lens, then everything else, up to about 12 edits per round.
4. Re-run the scripts, then send new critics for the lenses that scored < 8 only.
5. **Ratchet:** if a lens that passed drops below 8, revert the change that caused it.

## Pairwise judge (choosing between two versions)
Absolute scores drift; pairwise comparisons are steadier. Show both versions as A and B, in random order, and ask: "Which better achieves {criterion} for {audience}? Reply {"winner":"A|B","margin":"slight|clear|decisive","why":"≤30 words"}".
Use it for choosing between DNA concepts once each has a quick hero sketch, for the round-3 section rebuild, and for skill evals.
