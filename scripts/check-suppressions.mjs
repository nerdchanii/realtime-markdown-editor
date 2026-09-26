import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ADR-0015: bulk suppression files may only shrink. Each {file, rule} count must stay at or below
// the count on the base branch, so a violation cannot be allowed by raising a recorded count.
// Base: SUPPRESSIONS_BASE_REF, else origin/$GITHUB_BASE_REF in pull request CI, else origin/main.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const files = ["eslint-suppressions.json", "stylelint-suppressions.json"];
const baseRef =
  process.env.SUPPRESSIONS_BASE_REF ??
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "origin/main");

function git(args) {
  return spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
}

if (git(["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`]).status !== 0) {
  const message = `suppressions:check: base ref ${baseRef} is not available`;
  if (process.env.CI) {
    console.error(`${message}. Fetch it before running the check.`);
    process.exit(1);
  }
  console.log(`${message}; skipped locally. CI runs this check.`);
  process.exit(0);
}

function increasesIn(file, before, after) {
  const increases = [];
  for (const [path, rules] of Object.entries(after)) {
    for (const [rule, { count }] of Object.entries(rules)) {
      const allowed = before[path]?.[rule]?.count ?? 0;
      if (count > allowed) increases.push(`${file}: ${path} ${rule} ${allowed} -> ${count}`);
    }
  }
  return increases;
}

const increases = [];
for (const file of files) {
  const base = git(["show", `${baseRef}:${file}`]);
  if (base.status !== 0) {
    console.log(
      `suppressions:check: ${file} is new relative to ${baseRef}; it becomes the baseline`,
    );
    continue;
  }
  const after = JSON.parse(readFileSync(join(repoRoot, file), "utf8"));
  increases.push(...increasesIn(file, JSON.parse(base.stdout), after));
}

if (increases.length > 0) {
  console.error(`suppressions:check: suppression counts may only go down (base ${baseRef}):`);
  for (const increase of increases) console.error(`- ${increase}`);
  console.error("Fix the new violation instead of recording it.");
  process.exit(1);
}
console.log(`suppressions:check passed (base ${baseRef})`);
