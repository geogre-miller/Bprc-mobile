#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, ".claude", "skills");
const targetRoot = path.join(root, ".agents", "skills");
const names = ["stitch-ui", "stitch-inspect", "rn-context-map", "rn-ui-migrate", "visual-verify"];
const workers = {
  "stitch-inspect": "stitch-inspector",
  "rn-context-map": "rn-context-scout",
  "rn-ui-migrate": "rn-ui-migrator",
  "visual-verify": "visual-verifier",
};
const check = process.argv.includes("--check");

function parseClaudeSkill(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("SKILL.md must contain YAML frontmatter");
  const lines = match[1].split("\n");
  const get = (key) => {
    const line = lines.find((x) => x.startsWith(`${key}:`));
    if (!line) throw new Error(`Missing ${key} in skill frontmatter`);
    return line.slice(key.length + 1).trim();
  };
  return { name: get("name"), description: get("description"), body: match[2] };
}

function portableSkill(parsed) {
  let body = parsed.body;
  const worker = workers[parsed.name];
  if (worker) {
    body = `When this skill is explicitly invoked in Codex, delegate the requested task to the \`${worker}\` custom agent with fresh context. Do not execute the worker task in the parent orchestrator.

Pass only the bounded task arguments and relevant artifact paths. The worker must read this skill file as reference instructions directly; it must not recursively invoke \`$${parsed.name}\`.

Worker capability instructions:

${body}`;
  }
  return `---\nname: ${parsed.name}\ndescription: ${parsed.description}\n---\n${body}`;
}

function expectedOpenAI(name) {
  const explicitOnly = name === "stitch-ui";
  const display = name.split("-").map(x => x[0].toUpperCase() + x.slice(1)).join(" ");
  return `interface:
  display_name: "${display}"
  short_description: "${name === "stitch-ui" ? "Run Stitch to React Native migration" : "Bprc Stitch migration capability"}"
  default_prompt: "Use $${name} for the assigned Bprc Mobile workflow task."
policy:
  allow_implicit_invocation: ${explicitOnly ? "false" : "true"}
`;
}

let drift = false;

for (const name of names) {
  const src = path.join(sourceRoot, name, "SKILL.md");
  if (!fs.existsSync(src)) throw new Error(`Missing canonical skill: ${src}`);

  const portable = portableSkill(parseClaudeSkill(fs.readFileSync(src, "utf8")));
  const destDir = path.join(targetRoot, name);
  const dest = path.join(destDir, "SKILL.md");
  const meta = path.join(destDir, "agents", "openai.yaml");
  const openai = expectedOpenAI(name);

  if (check) {
    if (!fs.existsSync(dest) || fs.readFileSync(dest, "utf8") !== portable) {
      console.error(`Drift: ${path.relative(root, dest)}`);
      drift = true;
    }
    if (!fs.existsSync(meta) || fs.readFileSync(meta, "utf8") !== openai) {
      console.error(`Drift: ${path.relative(root, meta)}`);
      drift = true;
    }
    continue;
  }

  fs.mkdirSync(path.dirname(meta), { recursive: true });
  fs.writeFileSync(dest, portable);
  fs.writeFileSync(meta, openai);
  console.log(`synced ${name}`);
}

if (check && drift) process.exit(1);
if (check) console.log("Claude and Codex Stitch skills are in sync.");
