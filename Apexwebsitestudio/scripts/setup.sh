#!/usr/bin/env bash
# One-time install of the browser tooling used by inspect.mjs (Playwright + Chromium + axe-core).
set -e; T="$HOME/.apex-atelier/tools"; mkdir -p "$T"; cd "$T"
[ -f package.json ] || npm init -y >/dev/null
npm i -D playwright axe-core >/dev/null 2>&1
npx playwright install chromium >/dev/null 2>&1
[ -f "$HOME/.apex-atelier/history.json" ] || echo "[]" > "$HOME/.apex-atelier/history.json"
echo "apex-atelier tools ready in $T"
