#!/bin/bash
HOOK="$(dirname "$0")/block-dangerous-git.sh"
CASES="$(dirname "$0")/block-dangerous-git.cases.txt"
fail=0
while IFS=$'\t' read -r want cmd; do
  [ -z "$want" ] && continue
  if printf '%s' "$cmd" | jq -Rs '{tool_input:{command:.}}' | "$HOOK" >/dev/null 2>&1; then
    got=ALLOW
  else
    got=BLOCK
  fi
  if [ "$got" = "$want" ]; then
    echo "ok   $got  $cmd"
  else
    echo "FAIL want=$want got=$got  $cmd"
    fail=1
  fi
done < "$CASES"
exit $fail
