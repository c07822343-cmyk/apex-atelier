#!/usr/bin/env python3
"""Aggregate one skill version's eval runs into evals/log.csv.
Layout: evals/runs/<version>/<case>/{critic-*.json, audit.txt, meta.json?}
meta.json (optional): {"rounds":n,"agents":n,"tokens":n}"""
import csv, json, sys, re, pathlib, statistics as st
run = pathlib.Path(sys.argv[1]); ver = run.name; rows = []
for case in sorted(p for p in run.iterdir() if p.is_dir()):
    crit = [json.loads(f.read_text()) for f in case.glob("critic-*.json")]
    sc = [c.get("score", 0) for c in crit]; bl = sum(len(c.get("blockers", [])) for c in crit)
    gallery = sum(len(re.findall(r"\bF\d+\b", json.dumps(c))) for c in crit)
    a = (case / "audit.txt").read_text() if (case / "audit.txt").exists() else ""
    ab = int(m.group(1)) if (m := re.search(r"BLOCKERS (\d+)", a)) else ""
    meta = json.loads((case / "meta.json").read_text()) if (case / "meta.json").exists() else {}
    rows.append({"version": ver, "case": case.name, "mean": round(st.mean(sc), 2) if sc else "", "min": min(sc) if sc else "",
                 "blockers": bl, "audit_blockers": ab, "gallery_hits": gallery, **{k: meta.get(k, "") for k in ["rounds", "agents", "tokens"]}})
log = run.parent.parent / "log.csv"; new = not log.exists()
with open(log, "a", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["version"]); new and w.writeheader(); w.writerows(rows)
mins = [r["min"] for r in rows if r["min"] != ""]
print(f"{ver}: {len(rows)} cases | mean-min {st.mean(mins):.2f} | min≥8 on {sum(m>=8 for m in mins)}/{len(mins)} | gallery hits {sum(r['gallery_hits'] for r in rows)}" if mins else f"{ver}: no critic files")
