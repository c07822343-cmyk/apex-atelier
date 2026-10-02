# Apex Atelier

ApexWeb's Claude Code skill for building, redesigning and evaluating websites for local service businesses. It produces scroll-driven sites with layered heroes that are built to get phone calls.

**How it works:** one builder writes the site. Fresh critic agents that never saw the work in progress review it from screenshots. Free scripted checks (`audit.py`, `inspect.mjs`) run before any critic. The tooling is built to keep token use low.

## Install
```bash
unzip apex-atelier.zip -d ~/.claude/skills/   # or clone into ~/.claude/skills/apex-atelier
bash ~/.claude/skills/apex-atelier/scripts/setup.sh   # Playwright + axe, once
```

## Use
- "Evaluate breezepointac.com and build a redesign demo"
- "Make a demo for Sunrise Termite & Pest in Port St. Lucie"
- "This page looks templated, polish it"

See `SKILL.md` for the workflow and `evals/changelog.md` for version history.

## Push to GitHub
```bash
git remote add origin https://github.com/<you>/apex-atelier.git
git push -u origin main
```
