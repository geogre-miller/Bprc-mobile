# Claude workflow

Setup guide for this repository's Claude Code workflow. The core workflow runs after installing project dependencies; indexes and output-filtering tools improve context efficiency but are optional.

## What this workflow is

An orchestrator/worker split. An Opus orchestrator interprets the task, gathers facts, writes a task packet, and delegates bounded implementation to a Sonnet worker, keeping verbose output out of the expensive context.

| Agent | Model | Role |
| --- | --- | --- |
| `orchestrator` | opus | Task interpretation, architecture, risk, acceptance criteria, delegation |
| `rn-implementer` | sonnet | Implements one packet, returns a fixed status block |
| `rn-verifier` | sonnet | Read-only verification, screenshots, diff review |

Three project skills carry the per-role playbooks: `stitch-screen-spec` (design to packet), `rn-ui-implementation` (implementation order), `verify-change` (verification gate). Two path-scoped rule files in `rules/` load only when matching files are touched.

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
| `stitch` | http | `https://stitch.googleapis.com/mcp` with your own `X-Goog-Api-Key` header | orchestrator, for design work only |

Confirm with `/mcp` inside Claude Code. A server that fails to connect disables the workflow step that depends on it; it does not silently degrade.

## 4. Enable the plugins

`settings.json` enables Playwright so the verifier can screenshot the web target. The broad Expo and Stitch plugin bundles are disabled at project level to avoid always-on context; this workflow uses the focused Expo/Stitch MCP servers and project skills instead.

## 5. Optionally install the rtk rewrite hook

```bash
rtk init -g
```

This installs a global `PreToolUse` hook that rewrites plain commands to their `rtk` equivalents, so `npm run typecheck` runs as `rtk npm run typecheck` and `cat file` as `rtk read file`. Check it took effect with `rtk gain`. Without it, agents run narrow raw commands. The repository deliberately does not ship this hook, to avoid double-processing on machines that already have it globally.

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

For Stitch work, name the exact project, screen, target route, and intended platform in the request. The orchestrator fetches one screen, produces a packet, delegates, and calls the verifier only when risk or uncertainty warrants it.

Every delegation uses the packet template in `references/task-packet.md`. The design blocks are filled only for design work. Work spanning several screens or a migration starts from a concise ordered plan, with one packet per independently verifiable step.

## How the tools divide up

Three tools, three different questions. Mixing them up is the main way this workflow gets expensive:

- **CodeGraph** answers *what is this code and what does it say*. When its index is available, `codegraph_explore` returns source plus call paths in one call. Otherwise agents use targeted file reads rather than blocking the task.
- **GitNexus** answers *what breaks*. `impact({direction: "upstream", summaryOnly: true})` gives a ranked risk verdict with affected execution flows before editing a shared symbol; `detect_changes({scope: "all"})` reviews a diff before committing. Do not use its `query` or `context` for reading code, as they cost more round trips and return no source.
- **rtk** shrinks command output when installed. It is a quieter command runner, never a substitute for graph analysis.

The orchestrator records the GitNexus verdict in the packet's `RISK` field so the worker inherits the judgment instead of re-deriving it.

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
