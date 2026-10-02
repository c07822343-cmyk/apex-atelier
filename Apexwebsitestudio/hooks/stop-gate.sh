#!/usr/bin/env bash
# Optional Claude Code Stop hook: keeps the session from declaring an Atelier build done while scripts report blockers.
# .claude/settings.json → {"hooks":{"Stop":[{"hooks":[{"type":"command","command":"bash <skill>/hooks/stop-gate.sh","timeout":120}]}]}}
input=$(cat); echo "$input" | grep -q '"stop_hook_active": *true' && exit 0   # never loop
[ -f .atelier/target ] || exit 0                                              # only gate Atelier runs that declared a target
T=$(cat .atelier/target); D="$(cd "$(dirname "$0")/.." && pwd)"
A=$(python3 "$D/scripts/audit.py" "$T" --local 2>&1); a=$?
I=$(node "$D/scripts/inspect.mjs" "$T" 2>/dev/null); i=$?
[ $a -eq 0 ] && [ $i -ne 1 ] && exit 0
{ echo "Apex Atelier gate: blockers remain:"; echo "$A" | grep '✗' | head -8; echo "$I" | python3 -c "import json,sys
try: [print('  ✗',b) for b in json.load(sys.stdin)['blockers'][:8]]
except Exception: pass"; } >&2
exit 2
