#!/bin/bash
# Blocks destructive Git operations. Patterns are anchored to a real `git`
# invocation (start of line, or after ; | & && || $( ` ), optionally wrapped by
# the `rtk` output proxy, so that read-only commands mentioning the same words,
# such as `git log --grep push`, pass.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

GIT="(^|[;&|(\`]|&&|\|\||\\\$\()[[:space:]]*(rtk[[:space:]]+)?git([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]]+)?)*[[:space:]]+"

DANGEROUS_PATTERNS=(
  "${GIT}push"
  "${GIT}reset([[:space:]]|$).*--hard"
  "${GIT}clean([[:space:]]|$).*-[a-zA-Z]*f"
  "${GIT}branch([[:space:]]|$).*-D"
  "${GIT}checkout([[:space:]]+--)?[[:space:]]+\.([[:space:]]|$)"
  "${GIT}restore([[:space:]]+--)?[[:space:]]+\.([[:space:]]|$)"
  "${GIT}(push|branch|tag)([[:space:]]|$).*--force"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
