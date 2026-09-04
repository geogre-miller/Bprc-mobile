# Claude workflow

Setup guide for this repository's Claude Code workflow. Work through the checklist in order on a new machine; nothing below is optional unless it says so.

## What this workflow is

An orchestrator/worker split. An Opus orchestrator interprets the task, gathers facts, writes a task packet, and delegates bounded implementation to a Sonnet worker, keeping verbose output out of the expensive context.

| Agent | Model | Role |
| --- | --- | --- |
| `orchestrator` | opus | Task interpretation, architecture, risk, acceptance criteria, delegation |
| `rn-implementer` | sonnet | Implements one packet, returns a fixed status block |
| `rn-verifier` | sonnet | Read-only verification, screenshots, diff review |

Three project skills carry the per-role playbooks: `stitch-screen-spec` (design to packet), `rn-ui-implementation` (implementation order), `verify-change` (verification gate). Two path-scoped rule files in `rules/` load only when matching files are touched.

## 1. Install the toolchain

```bash
npm install
```

Then install the command-line tools the workflow depends on:

| Tool | Install | Why the workflow needs it |
| --- | --- | --- |
| `codegraph` | see the CodeGraph docs | Mandatory reading path. Agents query it instead of bulk-reading files. |
| `gitnexus` | `npx gitnexus@latest --help` | Risk verdicts before edits and diff review before commits. |
| `rtk` | `brew install rtk` or vendor instructions | Filters verbose command output before it reaches context. |
| `jq` | `brew install jq` | Required by the Git guardrail hook. |

Verify each resolves before continuing:

```bash
codegraph --version && gitnexus --version && rtk --version && jq --version
```

## 2. Build the code indexes

Both indexes are gitignored, so a fresh clone has neither. The agents are instructed to stop and ask rather than fall back to bulk file reads, so build them now:

```bash
codegraph init
npx gitnexus@latest analyze
```

Re-index after large refactors: `codegraph init` again, and `node .gitnexus/run.cjs analyze --index-only`.

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

`settings.json` already requests `expo`, `playwright`, and the three `stitch-*` plugin sets. Install any that `/plugin` reports as missing. Playwright is what lets the verifier screenshot the web target.

## 5. Install the rtk rewrite hook

```bash
rtk init -g
```

This installs a global `PreToolUse` hook that rewrites plain commands to their `rtk` equivalents, so `npm run typecheck` runs as `rtk npm run typecheck` and `cat file` as `rtk read file`. Check it took effect with `rtk gain`, which warns when no hook is installed. The repository deliberately does not ship this hook, to avoid double-processing on machines that already have it globally.

## 6. Verify the setup

```bash
bash .claude/hooks/block-dangerous-git.test.sh   # expect 24 ok lines, exit 0
npm run typecheck
npm run lint
```

## Running the workflow

```bash
claude --agent orchestrator
```

For Stitch work, name the exact project, screen, target route, and intended platform in the request. The orchestrator fetches one screen, produces a packet, delegates, and calls the verifier only when risk or uncertainty warrants it.

Every delegation uses the packet template in `references/task-packet.md`. The design blocks are filled only for design work. Work spanning several screens or a migration starts from a plan (`superpowers:writing-plans`), with one packet per step.

## How the tools divide up

Three tools, three different questions. Mixing them up is the main way this workflow gets expensive:

- **CodeGraph** answers *what is this code and what does it say*. `codegraph_explore` returns verbatim line-numbered source plus the call paths between symbols in one call. This is the reading path; bulk `Read`, `Grep`, and `Glob` for orientation are not acceptable.
- **GitNexus** answers *what breaks*. `impact({direction: "upstream", summaryOnly: true})` gives a ranked risk verdict with affected execution flows before editing a shared symbol; `detect_changes({scope: "all"})` reviews a diff before committing. Do not use its `query` or `context` for reading code, as they cost more round trips and return no source.
- **rtk** shrinks command output. It is a cheaper `cat` and a quieter test runner, never a substitute for graph analysis.

The orchestrator records the GitNexus verdict in the packet's `RISK` field so the worker inherits the judgment instead of re-deriving it.

## Git guardrail

`hooks/block-dangerous-git.sh` blocks push, destructive reset and clean, forced branch deletion, and whole-tree checkout or restore. Patterns are anchored to a real `git` invocation and also match the `rtk git` wrapper, so read-only lookalikes such as `git log --grep push` pass. `block-dangerous-git.cases.txt` holds both directions; run the test script after editing the patterns.

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
