# Self-improvement loop (improving the skill itself)
The Gauntlet improves a single site. This loop improves **Apex Atelier** across many sites. Ideas taken: eval suites, baselines, failure taxonomy, Reflexion-style lessons memory, multi-candidate selection, plateau stopping. Ideas left out: fine-tuning and RLHF (they need access to model weights), and self-grading (models overrate their own work, so judges stay blind and fresh).

## 1. Eval suite: `evals/evals.json`
Realistic user prompts across trades and modes (skill-creator format), with fixture files in `evals/files/`. `split:"train"` cases are used to tune the skill. `split:"holdout"` cases are touched **only** at a milestone, to catch overfitting.

## 2. Run
For each case, run the skill end to end. Save the Critic JSON files and the audit output to `evals/runs/<version>/<case>/`.

## 3. Score: `scripts/scorecard.py evals/runs/<version>`
Writes one row per run to `evals/log.csv`: mean lens score, min lens score, blockers, audit blockers, Gauntlet rounds used, agent count, failure-gallery hits. Where token counts are known, add them to the row.

## 4. Diagnose
Group the failures by taxonomy (failure-gallery F1–F10, plus any new F-codes). Pick the **single** most frequent failure.

## 5. One change per version
Change one thing: a rubric line, a prompt, a script check, or a DNA rule. Bump `VERSION` and write the hypothesis in `evals/changelog.md` ("Adding X should reduce F5 hits").

## 6. A/B test
Re-run the train cases with the new and old versions. A **pairwise blind judge** (references/critics.md) compares each pair, with the order randomized. Keep the change only if the new version wins at least 60% of pairs **and** no lens mean drops by more than 0.3.

## 7. Lessons memory (Reflexion)
After every real client build, the Director appends 1–3 lessons to `evals/lessons.md` as `[F-code] what happened → rule`. When a lesson repeats 3 times, promote it into `failure-gallery.md` as a blocker or into `audit.py` as a check. Script checks are preferred because they cost 0 tokens.

## 8. Stop rule
Stop iterating on a version when two consecutive changes each improve train mean-min-lens by less than 0.2, **or** all targets are met: min lens ≥ 8 on 90% of cases, zero gallery hits, a median of ≤ 2 Gauntlet rounds. Then run the holdout once. If holdout is more than 0.5 below train, the skill is overfit: revert the last changes and broaden the cases.

## 9. Multi-candidate selection (Tree-of-Thoughts, cheap version)
Already in Phase 2: three DNA concepts compared pairwise. For a failing hero after round 2, the Builder may produce 2 variants. The pairwise judge picks one and the other is discarded. Never generate more than 2 variants per section; the gains flatten out after that.

## 10. Cadence
Run a mini-eval of 3 train cases after any skill edit, and the full suite monthly or before sharing the skill. Keep `log.csv` so the trend is visible.
