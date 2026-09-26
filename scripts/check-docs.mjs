import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Enforces the documentation rules from ADR-0010:
// 1. Relative Markdown links in active docs must resolve.
// 2. ADRs use a known status; ADRs that declare a `gate` carry provenance fields,
//    and an accepted G2 ADR must be ratified by the user.
// 3. Active docs outside docs/adr and docs/direction may cite a proposed ADR only on a line
//    that marks it as proposed ("proposed" or "제안").
// 4. Style rule ids (UI-###) in the DESIGN.md rules table and in the enforcing configs match
//    (ADR-0015), so the documented rules and the enforced rules cannot drift apart.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const skippedDirs = new Set([".git", "node_modules", ".worktrees", "dist", "build", ".pnpm-store"]);
const archivedPrefixes = ["docs/archive/", "docs/research/"];
const adrStatuses = new Set(["proposed", "accepted", "superseded", "deprecated", "rejected"]);
const gates = new Set(["G0", "G1", "G2"]);

function toRepoPath(absolutePath) {
  return relative(repoRoot, absolutePath).replaceAll("\\", "/");
}

function collectMarkdown(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (skippedDirs.has(entry)) continue;
    const absolutePath = join(dir, entry);
    if (statSync(absolutePath).isDirectory()) collectMarkdown(absolutePath, files);
    else if (entry.endsWith(".md")) files.push(absolutePath);
  }
  return files;
}

function isActive(repoPath) {
  return !archivedPrefixes.some((prefix) => repoPath.startsWith(prefix));
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!field) continue;
    const value = field[2].replace(/\s+#.*$/, "").trim();
    fields[field[1]] = value.replace(/^["']|["']$/g, "");
  }
  return fields;
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

function checkLinks(absolutePath, text, errors) {
  const linkPattern = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const [, rawTarget] of stripCode(text).matchAll(linkPattern)) {
    if (/^[a-z]+:/i.test(rawTarget) || rawTarget.startsWith("#")) continue;
    const target = decodeURIComponent(rawTarget.split("#")[0]);
    if (!target) continue;
    if (!existsSync(resolve(dirname(absolutePath), target))) {
      errors.push(`${toRepoPath(absolutePath)}: broken link -> ${rawTarget}`);
    }
  }
}

function readAdrs() {
  const adrDir = join(repoRoot, "docs/adr");
  return readdirSync(adrDir)
    .filter((name) => /^\d{4}-.+\.md$/.test(name) && !name.startsWith("0000-"))
    .map((name) => {
      const absolutePath = join(adrDir, name);
      return { absolutePath, fields: parseFrontmatter(readFileSync(absolutePath, "utf8")) };
    });
}

function checkAdr({ absolutePath, fields }, errors) {
  const repoPath = toRepoPath(absolutePath);
  if (!adrStatuses.has(fields.status)) {
    errors.push(`${repoPath}: unknown ADR status "${fields.status ?? ""}"`);
  }
  if (fields.gate) checkAdrGate(repoPath, fields, errors);
}

function checkAdrGate(repoPath, fields, errors) {
  if (!gates.has(fields.gate)) errors.push(`${repoPath}: unknown gate "${fields.gate}"`);
  if (!fields.decided_by) errors.push(`${repoPath}: gated ADR is missing decided_by`);
  if (fields.gate === "G2" && fields.status === "accepted" && fields.ratified_by !== "user") {
    errors.push(`${repoPath}: accepted G2 ADR must have ratified_by: user`);
  }
}

function checkProposedCitations(repoPath, text, proposedIds, errors) {
  if (repoPath.startsWith("docs/adr/") || repoPath.startsWith("docs/direction/")) return;
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    for (const id of proposedIds) {
      if (line.includes(id) && !/proposed|제안/i.test(line)) {
        errors.push(`${repoPath}:${index + 1}: cites ${id} (proposed) without marking it proposed`);
      }
    }
  });
}

const styleRuleSources = [
  "stylelint.config.mjs",
  "eslint.config.mjs",
  "scripts/check-architecture.mjs",
  "apps/web/src/styles/global.css",
];

function styleRuleIds(text) {
  return new Set(text.match(/\bUI-\d{3}\b/g) ?? []);
}

function checkStyleRuleIds(errors) {
  const table = readFileSync(join(repoRoot, "DESIGN.md"), "utf8")
    .split("\n")
    .filter((line) => /^\|\s*UI-\d{3}\s*\|/.test(line))
    .join("\n");
  const documented = styleRuleIds(table);
  const enforced = new Set();
  for (const source of styleRuleSources) {
    for (const id of styleRuleIds(readFileSync(join(repoRoot, source), "utf8"))) enforced.add(id);
  }
  for (const id of documented) {
    if (!enforced.has(id)) errors.push(`DESIGN.md: ${id} is documented but not enforced anywhere`);
  }
  for (const id of enforced) {
    if (!documented.has(id)) errors.push(`${id} is enforced but missing from the DESIGN.md table`);
  }
}

function main() {
  const errors = [];
  const adrs = readAdrs();
  adrs.forEach((adr) => checkAdr(adr, errors));
  checkStyleRuleIds(errors);
  const proposedIds = adrs
    .filter(({ fields }) => fields.status === "proposed" && fields.id)
    .map(({ fields }) => fields.id);

  for (const absolutePath of collectMarkdown(repoRoot)) {
    const repoPath = toRepoPath(absolutePath);
    if (!isActive(repoPath)) continue;
    const text = readFileSync(absolutePath, "utf8");
    checkLinks(absolutePath, text, errors);
    checkProposedCitations(repoPath, text, proposedIds, errors);
  }

  if (errors.length > 0) {
    console.error(`docs:check found ${errors.length} problem(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("docs:check passed");
}

main();
