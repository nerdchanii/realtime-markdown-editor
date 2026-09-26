import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Runs stylelint (ADR-0015) and keeps stylelint-suppressions.json a strict ratchet:
// 1. New violations beyond the recorded counts fail (stylelint's own suppression check).
// 2. Recorded counts that are now too high also fail, so finished cleanup cannot be undone later.
//    `pnpm lint:css --prune` rewrites the file after a cleanup.

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const suppressionsPath = join(repoRoot, "stylelint-suppressions.json");
const targets = ["apps/web/src/**/*.{css,scss}"];
const prune = process.argv.includes("--prune");

function stylelint(args, stdio = "inherit") {
  return spawnSync("pnpm", ["exec", "stylelint", ...targets, ...args], {
    cwd: repoRoot,
    stdio,
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: "--no-warnings" },
  });
}

function currentSuppressions() {
  const dir = mkdtempSync(join(tmpdir(), "lint-css-"));
  const location = join(dir, "stylelint-suppressions.json");
  try {
    const result = stylelint(["--suppress", "--suppress-location", location], "pipe");
    if (result.status !== 0) {
      process.stderr.write(result.stdout + result.stderr);
      process.exit(result.status ?? 1);
    }
    return readFileSync(location, "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function normalize(json) {
  const sortKeys = (value) =>
    value && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, sortKeys(value[key])]),
        )
      : value;
  return `${JSON.stringify(sortKeys(JSON.parse(json)), null, 2)}\n`;
}

const check = stylelint(["--suppress-location", suppressionsPath]);
if (check.status !== 0) process.exit(check.status ?? 1);

const recorded = normalize(readFileSync(suppressionsPath, "utf8"));
const current = normalize(currentSuppressions());
if (recorded === current) process.exit(0);

if (prune) {
  writeFileSync(suppressionsPath, current);
  console.log("lint:css: stylelint-suppressions.json lowered to the current violations");
  process.exit(0);
}
console.error("lint:css: stylelint-suppressions.json records more violations than remain.");
console.error("Run `pnpm lint:css --prune` and commit the lowered file.");
process.exit(1);
