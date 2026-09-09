# Claude workflow

Setup guide for this repository's Claude Code workflow. The core workflow runs after installing project dependencies; indexes and output-filtering tools improve context efficiency but are optional.

## What this workflow is

V2 is a provider-neutral artifact workflow. A low-effort Opus control plane schedules bounded high-effort Sonnet workers, while deterministic scripts own health checks, caching, fingerprints, artifact validation, ownership conflicts, retries, and visual evidence generation.

| Agent | Model | Role |
| --- | --- | --- |
| `orchestrator` | Claude Opus 5, low | Thin control plane and scheduler integration |
| `stitch-inspector` | Claude Sonnet 5, high | Cache-first design evidence and DesignContract |
| `rn-context-scout` | Claude Sonnet 5, high | Repository contract, ownership, risk, and freshness dependencies |
| `rn-ui-migrator` | Claude Sonnet 5, high | Single-writer screen implementation without Stitch access |
| `visual-verifier` | Claude Sonnet 5, high | Fresh semantic verification using deterministic capture/diff evidence |

The commands are `/stitch-ui`, `/stitch-inspect`, `/rn-context-map`, `/rn-ui-migrate`, `/visual-verify`, and `/agent-health`. Canonical skills live in `.claude/skills`; `npm run agents:sync` generates the matching Codex skills.

`CLAUDE.md` intentionally does not import `AGENTS.md`: that file is maintained by GitNexus and includes a generated instruction block. The applicable Expo-version and impact-analysis policies are summarized once in `CLAUDE.md` to avoid contradictory always-on instructions.

## 1. Install the toolchain

```bash
npm install
```

Then install the command-line tools the workflow depends on:

| Tool | Install | Why the workflow needs it |
| --- | --- | --- |
| `codegraph` | see the CodeGraph docs | Optional indexed code navigation. |
| `gitnexus` | run via `npx gitnexus@latest` | Optional impact verdicts and graph-aware diff review. |
| `rtk` | `brew install rtk` or vendor instructions | Optional filtering for verbose command output. |
| `jq` | `brew install jq` | Required by the Git guardrail hook. |

Verify each resolves before continuing:

```bash
codegraph --version
npx gitnexus@latest --version
rtk --version
jq --version
```

## 2. Build the code indexes

Both indexes are gitignored, so a fresh clone has neither. Build them for faster repository analysis; agents fall back to targeted source reads when an index is unavailable:

```bash
codegraph init
npx gitnexus@latest analyze
```

Re-index after large refactors: `codegraph sync`, and `node .gitnexus/run.cjs analyze --index-only` (or `npx gitnexus@latest analyze`).

## 3. Configure the MCP servers

These live in your user configuration, not in the repository, because two of them carry personal credentials. Add them with `claude mcp add`, or edit `~/.claude.json`:

| Server | Type | Command or URL | Needed by |
| --- | --- | --- | --- |
| `codegraph` | stdio | `codegraph serve --mcp` | all three agents |
| `gitnexus` | stdio | `npx gitnexus mcp` | orchestrator, implementer, verifier |
| `expo` | http | `https://mcp.expo.dev/mcp` | implementer, for SDK 57 API facts |
| `stitch` | http | `https://stitch.googleapis.com/mcp` with your own `X-Goog-Api-Key` header | Stitch inspector only |

Confirm with `/mcp` inside Claude Code. Required Stitch access blocks honestly when no valid cache exists. Optional CodeGraph/GitNexus capabilities use the documented targeted-source fallback and record unresolved risk instead of silently degrading.

## 4. Enable the plugins

`settings.json` enables Playwright so the verifier can screenshot the web target. The broad Expo and Stitch plugin bundles are disabled at project level to avoid always-on context; this workflow uses the focused Expo/Stitch MCP servers and project skills instead.

## 5. Optionally install the rtk rewrite hook

```bash
rtk init -g
```

This may install a global `PreToolUse` rewrite hook. Agents use only command forms supported by the installed RTK version and must never add a second prefix when the hook already rewrites commands. They do not blindly wrap arbitrary commands or run raw output after every compact command. Without RTK, the workflow uses the equivalent raw commands. Check aggregate savings with `rtk gain` when available.

## 6. Verify the setup

```bash
bash .claude/hooks/block-dangerous-git.test.sh   # all cases should print ok; exit 0
npm run typecheck
npm run lint
```

## Running the workflow

```bash
claude --agent orchestrator
```

For Stitch work, name the exact project, screen, target route, and intended platform, then use `/stitch-ui <target>`. The orchestrator runs cache/freshness gates and delegates only stale discovery. The workflow always runs a fresh verifier after deterministic checks; it does not make visual verification conditional on risk. Detailed state lives in `artifacts/stitch/<screen>/index.json` and versioned contracts, not task transcripts.

## How the tools divide up

Three tools, three different questions. Mixing them up is the main way this workflow gets expensive:

- **CodeGraph** answers *what is this code and what does it say*. When its index is available, `codegraph_explore` returns source plus call paths in one call. Otherwise agents use targeted file reads rather than blocking the task.
- **GitNexus** answers *what breaks*. `impact({direction: "upstream", summaryOnly: true})` gives a ranked risk verdict with affected execution flows before editing a shared symbol; `detect_changes({scope: "all"})` reviews a diff before committing. Follow repository GitNexus instructions for concept and named-symbol queries.
- **rtk** shrinks command output when installed. It is a quieter command runner, never a substitute for graph analysis.

The repository scout records the GitNexus verdict in the RepoContract so the migrator inherits the judgment instead of re-deriving it.

## Git guardrail

`hooks/block-dangerous-git.sh` is a defense-in-depth check for common direct and wrapped forms of push, destructive reset and clean, forced branch deletion, and whole-tree checkout or restore. It is not a complete shell parser, so Claude's permission policy remains the primary gate. Read-only lookalikes such as `git log --grep push` pass. `block-dangerous-git.cases.txt` holds both directions; run the test script after editing the patterns.

The guardrail blocks pushes unconditionally, including ones you asked for. Run those yourself in the session with a `!` prefix, or from your own terminal.

## Configuration checks

```text
/memory       loaded CLAUDE.md and rules
/skills       available project and plugin skills
/agents       orchestrator and workers
/mcp          codegraph, gitnexus, expo, stitch
/hooks        Git guardrail and the rtk rewrite
/permissions  resolved tool policy
/doctor       installation diagnostics
```

Personal proxy configuration stays in the ignored `settings.local.json`.
