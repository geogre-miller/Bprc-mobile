#!/bin/bash
# Defense-in-depth for common direct and wrapped destructive Git invocations.
# This is not a shell parser; Claude's permission policy remains the primary gate.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

BOUNDARY="(^|[;&|(\`]|&&|\|\||\\\$\()[[:space:]]*"
WRAPPERS="((command|sudo)[[:space:]]+|env([[:space:]]+(-[^[:space:]]+|[A-Za-z_][A-Za-z0-9_]*=[^[:space:]]+))*[[:space:]]+)*"
GIT_EXEC="(rtk[[:space:]]+)?([^[:space:];|&()]*/)?git"
GIT="${BOUNDARY}${WRAPPERS}${GIT_EXEC}([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]]+)?)*[[:space:]]+"

DANGEROUS_PATTERNS=(
  "${GIT}push"
  "${GIT}reset([[:space:]]|$).*--hard"
  "${GIT}clean([[:space:]]|$).*-[a-zA-Z]*f"
  "${GIT}branch([[:space:]]|$).*-D"
  "${GIT}checkout[[:space:]]+([^;&|[:space:]]+[[:space:]]+)*(\.|:/)([[:space:]]|$)"
  "${GIT}restore[[:space:]]+([^;&|[:space:]]+[[:space:]]+)*(\.|:/)([[:space:]]|$)"
  "${GIT}(push|branch|tag)([[:space:]]|$).*--force"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
