#!/usr/bin/env python3
"""Apex Atelier static auditor. No dependencies. python3 audit.py <dir|file> [--local]
--local adds local-service conversion and schema checks. Exit 1 if there are blockers."""
import re, sys, json, pathlib
SLOP = ["mastery","estates","absolute craftsmanship","bespoke","excellence","world-class","your trusted partner","solutions for","unlock the power","elevate your","seamless","lorem ipsum","cutting-edge","revolutioniz","in today's fast-paced","welcome to our website","click here","we are a family owned business dedicated"]
args = [a for a in sys.argv[1:] if not a.startswith("--")]; LOCAL = "--local" in sys.argv
root = pathlib.Path(args[0] if args else ".")
pages = [root] if root.is_file() else [p for p in root.rglob("*.html") if not {"node_modules",".atelier"} & set(p.parts)]
B, W = [], []
for p in pages:
    h = p.read_text(errors="ignore"); low = h.lower(); r = p.name
    b = lambda m: B.append(f"{r}: {m}"); w = lambda m: W.append(f"{r}: {m}")
    nob = re.sub(r'data:[^"\')\s]{100,}', 'data:x', h); kb = len(h)/1024
    if not re.search(r"<html[^>]*\blang=", low): b("missing <html lang>")
    if 'name="viewport"' not in low: b("missing viewport meta")
    if "<title>" not in low: b("missing <title>")
    if 'name="description"' not in low: w("missing meta description")
    n = len(re.findall(r"<h1[\s>]", low)); n != 1 and b(f"{n} <h1> (want 1)")
    imgs = re.findall(r"<img\b[^>]*>", nob, re.I)
    for i, img in enumerate(imgs):
        if not re.search(r"\balt=", img, re.I): b(f"img without alt: {img[:70]}")
        if not (re.search(r"\bwidth=", img) and re.search(r"\bheight=", img)) and "aspect-ratio" not in img: w(f"img without width/height: {img[:70]}")
        if i == 0 and 'loading="lazy"' in img: b("first/hero image is lazy-loaded (hurts LCP)")
    if imgs and "fetchpriority" not in low: w("no fetchpriority=high on the LCP image")
    if "<main" not in low: w("no <main> landmark")
    if re.search(r"(animation|transition)\s*:", low) and "prefers-reduced-motion" not in low: b("motion without prefers-reduced-motion")
    if re.search(r"outline\s*:\s*(none|0)", low) and ":focus-visible" not in low: b("focus outline removed with no :focus-visible")
    for s in re.findall(r"<script\b[^>]*\bsrc=[^>]*>", low):
        if not re.search(r"\b(defer|async)\b|type=.module", s): w(f"render-blocking script: {s[:70]}")
    fams = set(re.findall(r"family=([A-Za-z+]+)", h)); len(fams) > 2 and w(f"{len(fams)} web font families")
    for f in ["Inter:", "Roboto:", "Arial"]:
        if re.search(rf"font-family\s*:\s*['\"]?{f.rstrip(':')}['\"]?\s*[,;]", h) and len(fams) <= 1: w(f"default-looking font stack ({f.rstrip(':')} only)")
    if re.search(r"linear-gradient\([^)]*(#6366f1|#8b5cf6|#7c3aed|purple)[^)]*(#3b82f6|#06b6d4|blue)", low): w("purple→blue gradient (AI-template tell)")
    for ph in SLOP:
        if ph in low: w(f"slop copy: '{ph}'")
    if re.search(r"<a\b[^>]*>\s*</a>", low): b("empty link")
    if 'href="#"' in low: w('placeholder href="#"')
    if "[[needs:" in low: w(f"{low.count('[[needs:')} [[NEEDS]] placeholders remain")
    if kb > 1500: w(f"{kb:.0f}KB file; run slice.py blobs and move big images out")
    # F1: ApexWeb house style leaking into a client site
    house = [f for f in ["Inter Tight","Instrument Serif","JetBrains Mono"] if f.lower() in low or f.replace(" ","+").lower() in low]
    if LOCAL and len(house) >= 2: b(f"ApexWeb house fonts on a client site ({', '.join(house)}): failure F1")
    if re.search(r"<h1[^>]*>(?:(?!</h1>).)*<(em|i)\b", h, re.S | re.I): w("italic accent word inside the H1 (F1 tell; fine only if the DNA chose it deliberately)")
    if LOCAL:
        tels = re.findall(r'href="tel:([^"]+)"', low)
        if not tels: b("no tel: link")
        first = low.find('href="tel:'); h1 = low.find("<h1")
        if tels and h1 > 0 and first > h1 + 6000: w("first tel: link is far below the h1; put the phone in the hero")
        if "position:fixed" not in low.replace(" ", "") and "position:sticky" not in low.replace(" ", ""): w("no sticky/fixed element; add a mobile call bar")
        ld = re.findall(r'<script[^>]*application/ld\+json[^>]*>([\s\S]*?)</script>', h)
        if not ld: b("no JSON-LD (LocalBusiness subtype)")
        for j in ld:
            try:
                d = json.loads(j); d = d if isinstance(d, list) else d.get("@graph", [d])
                for o in d:
                    t = str(o.get("@type", ""))
                    if any(k in t for k in ["Business","Service","Contractor","Plumber","Electrician"]):
                        miss = [k for k in ["name","telephone","address","url","areaServed"] if k not in o]
                        miss and w(f"schema {t} missing {miss}")
                        if "aggregateRating" in o: w("aggregateRating present; confirm the reviews are real and first-party")
            except Exception as e: b(f"invalid JSON-LD: {e}")
        if not re.search(r"licen[sc]e|insured|certified|bonded", low): w("no licence/insured/certified trust line")
        if not re.search(r"review|★|stars?", low): w("no reviews or rating visible")
        for f in re.findall(r"<form[\s\S]*?</form>", low):
            k = len(re.findall(r"<(input|select|textarea)\b(?![^>]*type=.(hidden|submit))", f)); k > 6 and w(f"form has {k} fields (keep it to 5 or fewer)")
            if "type=\"tel\"" not in f: w("form without type=tel phone field")
for c in [] if root.is_file() else [f for f in root.rglob("*.css") if "node_modules" not in f.parts]:
    css = c.read_text(errors="ignore"); hx = set(re.findall(r"#[0-9a-fA-F]{3,6}\b", re.sub(r":root\s*{[^}]*}", "", css)))
    len(hx) > 6 and W.append(f"{c.name}: {len(hx)} raw hex colors outside tokens")
print(f"APEX AUDIT ({len(pages)} page(s){', local checks' if LOCAL else ''})")
print(f"BLOCKERS {len(B)}"); [print("  ✗", x) for x in B]
print(f"WARNINGS {len(W)}"); [print("  !", x) for x in W]
sys.exit(1 if B else 0)
