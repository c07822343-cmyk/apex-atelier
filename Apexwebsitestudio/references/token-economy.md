# Token economy
The rule behind every item here: spend tokens on judgement, not on moving bytes around.

| Lever | Practice | Evidence |
|---|---|---|
| One pen | For Demo/Polish you build it yourself. Subagents are for breadth (scouts, critics), not for handing off one page. | Multi-agent systems use ~15× chat tokens (Anthropic research system); coding parallelises poorly (Cognition). |
| Scripts first | audit.py + inspect.mjs before any critic. Critics get the inspect JSON so they don't rediscover the same issues. | Code-side filtering took one Anthropic task from 150k to 2k tokens. |
| Cache | Critic prompts share a byte-identical opening paragraph and launch in one message. Don't switch models mid-session. | Cache reads cost 0.1× input; subagents spread across time miss the 5-minute window (~14% overspend measured). |
| Model routing | haiku for scouts, sonnet for builders and most critics, opus only for the brand critic and hard rebuilds. | Haiku is ~15× cheaper than Opus for lookup work. |
| Big files | `slice.py map` (≈300 tokens) then `get <id>`; `slice.py blobs` to find inlined images to move out. Edit with exact-match replacements. | A 2.4MB single-file demo is ~600k tokens if read whole. Search/replace edits beat diffs and rewrites (aider; arXiv 2609.05779). |
| Pixels | Page text and the accessibility tree for structure. Screen-sized tour PNGs (~1.1k tokens each) for visual judgement. Downscale anything else before viewing: `sips -Z 900 in.png --out /tmp/x.jpg`. | Image tokens ≈ w×h/750. A 1440×9787 strip is downscaled until it's illegible. |
| Returns | Subagents reply in JSON of ≤ 300 tokens. Bulk goes to `.atelier/` and they return the path. | Structured handoffs cut redundant spend 30–50%. |
| Stale context | Don't re-read files you just edited. Once findings are merged, refer to them by file. | Masking old observations matches summarisation quality at >50% lower cost (JetBrains/TUM). |
| Stop | Three Gauntlet rounds at most, then rebuild the section differently or ship with notes. | Quality gains flatten out fast after round 2 in practice. |

Typical budget for a Demo: build ≈ 60–120k tokens in your own context, scripts ≈ 0, critics ≈ 3 × 25k, one fix round ≈ 30k.
