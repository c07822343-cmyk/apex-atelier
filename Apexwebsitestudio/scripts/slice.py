#!/usr/bin/env python3
"""Token-saving navigator for huge single-file HTML.
  slice.py map <file>            -> section index (id, tag, line range, KB)
  slice.py get <file> <id> [pad] -> print only that section (base64 blobs elided)
  slice.py blobs <file>          -> list big inline data: URIs (candidates to externalize)"""
import re, sys
def lines(f): return open(f, errors="ignore").read().split("\n")
def sections(L):
    out = []
    for i, l in enumerate(L):
        m = re.search(r'<!--\s*§([\w-]+)', l) or re.search(r'<(section|header|footer|main|nav|style|script)\b[^>]*?(?:id="([\w-]+)")?', l)
        if m:
            sid = m.group(1) if m.re.pattern.startswith('<!--') else (m.group(2) or m.group(1))
            out.append([sid, i + 1])
    res = []
    for j, (sid, s) in enumerate(out):
        e = out[j + 1][1] - 1 if j + 1 < len(out) else len(L)
        res.append((sid, s, e, sum(len(x) for x in L[s - 1:e]) / 1024))
    return res
def elide(t): return re.sub(r'data:[\w/+.-]+;base64,[A-Za-z0-9+/=]{200,}', lambda m: f"data:…[{len(m.group())//1024}KB elided]", t)
if __name__ == "__main__":
    cmd, f = sys.argv[1], sys.argv[2]; L = lines(f)
    if cmd == "map":
        for sid, s, e, kb in sections(L): print(f"{sid:28} L{s}-{e}  {kb:7.1f}KB")
    elif cmd == "get":
        pad = int(sys.argv[4]) if len(sys.argv) > 4 else 0
        for sid, s, e, _ in sections(L):
            if sid == sys.argv[3]:
                print(elide("\n".join(f"{n}: {x}" for n, x in enumerate(L[max(0, s-1-pad):e+pad], max(1, s-pad))))); break
        else: sys.exit(f"no section {sys.argv[3]}")
    elif cmd == "blobs":
        for n, l in enumerate(L, 1):
            for m in re.finditer(r'data:([\w/+.-]+);base64,[A-Za-z0-9+/=]{20000,}', l): print(f"L{n} {m.group(1)} {len(m.group())//1024}KB")
