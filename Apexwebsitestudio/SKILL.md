---
name: apex-atelier
description: ApexWeb's website studio for building, redesigning and evaluating websites, especially for local service businesses (HVAC, pest control, plumbing, roofing, CPAs, contractors, cabling, cleaning, med spas, dentists…). Produces distinctive, scroll-driven, high-converting sites with layered heroes and scrollytelling through a lean builder + blind-critic loop with scripted browser checks. Use this skill whenever the user wants a website, landing page, demo or mock-up for a prospect, a redesign of an existing site, a "free website evaluation" or teardown, or says a site looks generic, templated, AI-made or broken on mobile, even if they don't say "skill" or name ApexWeb. Not for one-line CSS fixes or non-web design work.
---

# Apex Atelier

AI-built websites fail in the same five ways: they look like a template, every client looks like the agency that built them, facts get invented, mobile breaks, and the phone number is buried. This skill is a loop designed to stop each of those, at the lowest token cost that still gets a portfolio-grade result.

The loop has three roles: a **Director** (you), one **Builder** who holds the pen, and **blind Critics** who never see how the work was made. Scripts judge everything they can judge for free. Models judge only what scripts can't, which is mostly taste, clarity and persuasion.

## One-time setup
`bash scripts/setup.sh` installs Playwright and axe-core into `~/.apex-atelier/tools` (about 150MB, once). Without it, `inspect.mjs` exits with a clear message and you fall back to `audit.py` plus browser-pane screenshots.

## Pick the mode

| User says | Mode | Output |
|---|---|---|
| "evaluate / audit / what's wrong with <site>" | **Evaluate** | `evaluation.md` (ApexWeb's free-evaluation deliverable) + screenshots |
| "make a demo / mock-up for <prospect>" | **Demo** | one self-contained `index.html` (plus an `img/` folder if photos exist) |
| "build the site for <client>" | **Build** | multi-page static site + launch checklist |
| "fix / polish / this looks generic" | **Polish** | the same files, improved, and a before/after report |

A redesign is **Evaluate then Demo**: the evaluation becomes the brief.

## Roles, models and why

| Role | Who | Model | Why this split |
|---|---|---|---|
| Director | you | session model | Holds the brief, makes design decisions once, merges critic feedback. |
| Builder | **you** for Demo/Polish; one subagent per page for Build | session model / `sonnet` | One pen keeps style decisions consistent. Parallel writers on one page produce a patchwork (Cognition, Berkeley MAST). For a single page, handing off to a subagent costs more context than it saves. |
| Scouts | subagents, read-only | `haiku` | Teardown of the old site, facts, competitors. Cheap breadth, returns ≤ 300 tokens. |
| Critics | fresh subagents, read-only | `sonnet`; `opus` for Brand | A model grading its own work is reliably too kind. A fresh context that sees only the result is not. |

Launch parallel agents **in one message** with an identical opening paragraph, so their shared prompt prefix is cached and the five-minute cache window isn't wasted.

## The loop

### 1. Facts first (`.atelier/brief.json`, from `templates/brief.json`)
Collect name, trade, city, service area, phone, services, licences, reviews, guarantees, years in business, and existing photos. Get them from the user's message, the prospect's current site (scout it) or files they point to. **Every fact needs a source.** Anything you don't have goes into the page as a visible `[[NEEDS: review count]]` placeholder and into a list you hand back. The reason: an invented "4.9★ from 300 reviews" or a fake licence number on a real business's demo is a legal and trust problem, and it's the fastest way to lose the client. Ask the user at most three questions, and only ones whose answers change the build. Assume everything else and log the assumption.

### 2. Direction (`.atelier/dna.json`)
Read `references/design.md` and `references/failure-gallery.md` first. Then write **three concepts that disagree with each other**, one line each:
`borrowed artifact · light/dark · display face + text face · layout grammar · palette source · signature moment`.
The borrowed artifact is the key move. It's a real object from the client's trade or place that the design can grow out of (a termite inspection report, a ledger, a hurricane shutter spec sheet). That object is what makes a site impossible to mistake for a template.

Reject any concept that:
- uses ApexWeb's own look (near-black, serif with one *italic accent word*, mono eyebrows);
- matches two or more traits of the last three builds in `~/.apex-atelier/history.json`;
- fails the swap test (put a competitor's logo on it; would anyone notice?).

Pick the strongest survivor, write it down with the two rejects and why, and don't revisit it.

### 2b. Experience plan (`.atelier/score.md`)
Read `references/experience.md` and write the scroll score: one device per section (at least 4 families, none repeated side by side), the feeling curve, one **peak**, and the sentence "It's the site where ___". This is what separates an experience from a correct document. The trial sites skipped it and looked like ordinary websites.

### 3. Contract (`.atelier/contract.md`)
List the sections, each with one job, its layout grammar (no two neighbours alike) and testable acceptance lines. Read `references/copy.md` and `references/local-conversion.md` before writing this; most of the conversion work is decided here, not in CSS. Aim for a homepage of no more than about 7 desktop screens. Every section has to earn its place.

### 4a. Hero gate (the cheapest place to fix taste)
Build **only the header and the dimensional hero** first (at least 3 moving planes, per `references/experience.md` §2). Run `inspect.mjs --shots`, then send one brand critic (`opus`) on the first mobile and desktop screens. It needs a score of 8 or more before you build anything else. In trials, brand was the lens stuck at 7 after three full rounds, because its problems (palette, concept, motif) are baked into every section once the page exists. Changing direction at the hero costs a few thousand tokens. Changing it after the build means a rebuild.

### 4b. Build the rest
- Write the copy first, then the HTML/CSS. Use real words in real lengths, because layout built around lorem breaks when the truth arrives.
- Use the tokens from `dna.json` as CSS custom properties. Follow `references/design.md` for type, colour, spacing, motion and images.
- Put a `<!-- §section-id -->` marker at the start of each section, so `scripts/slice.py` can find sections later without reading the whole file.
- Build the scroll devices from `score.md`, with the **peak** (the signature moment) last, as progressive enhancement. The artifact leads the hero and comes back in **at most two** other places. Stamped on every card, it stops being a moment and becomes a costume (a trial critic's words). It has to work without JS, respect `prefers-reduced-motion`, and help the visitor decide to call, not distract them from it.
- Images go through `references/assets.md`. Never ship an empty box where a photo "will go".

### 5. Scripts gate (free)
```bash
python3 scripts/audit.py <file-or-dir> --local      # static checks, < 1s
node scripts/inspect.mjs <file> --shots --out .atelier/shots   # real browser at 375 and 1280, axe, overflow, header collisions, CLS
```
Fix every blocker before any critic sees the page. Critics are expensive, and spending them on a missing `alt` wastes them.

### 6. The Gauntlet (blind critics)
Send critics in one message, following `references/critics.md`.
- **Demo/Polish:** three critics. Conversion, Brand and Craft (which covers mobile).
- **Build:** add Access/Perf and Adversarial.

Each critic sees only:
- the two contact sheets (`sheet-mobile.png`, `sheet-desktop.png`), which show the whole page in 2 images instead of ~20;
- the file path;
- the contract;
- its rubric with calibration anchors;
- the inspect report, so it doesn't re-report script findings.

Each returns JSON.
- **Pass:** every lens scores ≥ 8 and there are no blockers.
- **Otherwise:** merge the fixes into one prioritised list. Apply only those fixes with exact-match edits. Fixes may restyle, reorder or cut, but they may not add new sections; in trials, pages grew from 7 to 10 screens one fix at a time. Then re-run the scripts, then run **new** critics on the failing lenses. A critic that saw the old draft anchors on it.
- **Ratchet:** a change that lowers another lens gets reverted.
- **Limit:** stop after three rounds. If a section is still failing in round three, rebuild that section from a different layout grammar instead of patching it a fourth time. If it still fails, ship and list the problem honestly.

### 7. Hand-off
- Run `inspect.mjs --shots` one last time.
- Append this build's traits to `~/.apex-atelier/history.json` (see `references/failure-gallery.md`). That's how the next site is guaranteed to look different.
- Write `.atelier/ledger.md`: decisions, rounds, critic scores, known issues, and every `[[NEEDS]]`.
- Reply to the user in no more than 10 lines: what was built, the scores, the open `[[NEEDS]]`, and 2–3 screenshots (mobile first screen, desktop first screen, the signature moment).

## Evaluate mode
1. Run `node scripts/inspect.mjs <url> --shots` on the prospect's site, plus `get_page_text` (or a scout) for the copy.
2. Score it with the critic rubrics, yourself. You're judging someone else's work here, so there's no self-grading problem.
3. Fill in `templates/evaluation.md`: a plain-English verdict, the five biggest leaks ranked by lost calls, each with evidence (a screenshot or a measured number) and the fix, and what ApexWeb would build instead.
4. Keep the tone honest and kind. If the site is genuinely good, say so; the offer promises that.

## Build mode (multi-page)
- **Phases 1–3** stay with you.
- **Shared foundation:** build `tokens.css`, the header, the footer and one reference page yourself.
- **Remaining pages:** give each to a builder subagent (`sonnet`) with `dna.json`, `contract.md`, the reference page and the list of files it owns. Run up to 4 at once, and only with `isolation: "worktree"` when they touch shared files.
- **Then:** run the Gauntlet per page template, and work through `references/launch.md`. Service-area pages each need unique local substance, or Google treats them as doorway pages.

## Budget (default caps; say so if you exceed them)
| Mode | Agents | Target tokens |
|---|---|---|
| Evaluate | 0–1 scout | ≤ 60k |
| Demo / Polish | 1 hero critic + 3 critics per round, at most 2 rounds | ≤ 350k |
| Build | +1 builder per page (max 4) | ≤ 300k per page |

Ways to stay under:
- **Skip:** no scouts when the user gave you the facts.
- **Show critics less:** critics see contact sheets, not individual screenshots.
- **Re-run only what failed:** round 2 re-checks only the lenses that failed.
- **Don't re-read:** never re-read a file you just wrote.

## Token discipline (details in `references/token-economy.md`)
- **Large files:** never read a file over 50KB whole. Use `scripts/slice.py map|get`, and edit with exact-match replacements, not rewrites.
- **Checking a page:** prefer page text and the accessibility tree to screenshots for structure, and use screenshots for visual judgement only. The scroll tour produces screen-sized images on purpose, because a full-page strip gets shrunk until it's unreadable.
- **Agent replies:** every subagent replies in compact JSON. Bulky output goes to `.atelier/` and the subagent returns just the path.

## Reference map (read when the step needs it)
- `references/experience.md`: dimensional hero, scroll score, device families, peak. Read for step 2b and step 4.
- `references/design.md`: type pairings, layout grammars, colour, motion, images, modern CSS. Read for step 2 and step 4.
- `references/copy.md`: headline and section formulas, banned words, voice. Read for step 3.
- `references/local-conversion.md`: call-first patterns, trust, forms, schema, service-area pages, AI search. Read for step 3.
- `references/failure-gallery.md`: ten ways past builds failed and the history file. Read for step 2, and critics read it too.
- `references/critics.md`: the critic prompt, lenses, calibration anchors and fix-merging. Read for step 6.
- `references/assets.md`: photo inventory, gaps and the processing script.
- `references/example-run.md`: one complete worked run, from brief to hand-off. Read it once if you're unsure how the pieces fit.
- `references/launch.md`, `references/token-economy.md`, `references/self-improvement.md`: Build mode, budgets, and how to improve this skill with evals.
