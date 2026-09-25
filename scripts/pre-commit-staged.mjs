import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

function normalizeRepoPath(file) {
  return file.replaceAll("\\", "/").replace(/^\.\//, "");
}

function extensionOf(file) {
  const match = file.match(/\.([^./]+)$/);
  return match ? match[1] : "";
}

function hasExtension(file, extensions) {
  return extensions.includes(extensionOf(file));
}

function isRootFile(file) {
  return !file.includes("/");
}

function isWorkspacePackageFile(file) {
  return /^((apps|packages)\/[^/]+\/)?package\.json$/.test(file);
}

function isTsConfigFile(file) {
  return /(^|\/)tsconfig(\.[^./]+)?\.json$/.test(file);
}

function isSourceTsFile(file) {
  return (
    /^apps\/.+\.(ts|tsx)$/.test(file) ||
    /^packages\/.+\.ts$/.test(file) ||
    /^e2e\/.+\.ts$/.test(file)
  );
}

function isPrettierTarget(file) {
  if (!existsSync(join(repoRoot, file))) return false;
  if (/^apps\/.+\.(ts|tsx|css|json|html)$/.test(file)) return true;
  if (/^packages\/.+\.ts$/.test(file)) return true;
  if (/^e2e\/.+\.ts$/.test(file)) return true;
  if (/^scripts\/.+\.mjs$/.test(file)) return true;
  return isRootFile(file) && hasExtension(file, ["json", "js", "mjs", "cjs", "yaml", "yml"]);
}

function isLintTarget(file) {
  if (!existsSync(join(repoRoot, file))) return false;
  if (isSourceTsFile(file)) return true;
  if (/^scripts\/.+\.mjs$/.test(file)) return true;
  return isRootFile(file) && hasExtension(file, ["js", "mjs", "cjs"]);
}

function needsTypecheck(file) {
  return (
    isSourceTsFile(file) ||
    isTsConfigFile(file) ||
    isWorkspacePackageFile(file) ||
    file === "pnpm-lock.yaml"
  );
}

function needsCollabTypecheck(file) {
  return (
    /^apps\/collab\/.+\.ts$/.test(file) ||
    file === "apps/collab/package.json" ||
    /^apps\/collab\/tsconfig(\.[^./]+)?\.json$/.test(file) ||
    file === "pnpm-lock.yaml"
  );
}

function needsArchitectureCheck(file) {
  return (
    /^apps\/.+\.(ts|tsx)$/.test(file) ||
    /^packages\/.+\.ts$/.test(file) ||
    file === ".dependency-cruiser.cjs" ||
    file === "scripts/check-architecture.mjs" ||
    isTsConfigFile(file) ||
    isWorkspacePackageFile(file) ||
    file === "pnpm-lock.yaml"
  );
}

function needsDocsCheck(file) {
  return /\.md$/.test(file) || file === "scripts/check-docs.mjs";
}

function needsTest(file) {
  return (
    /^apps\/.+\.(ts|tsx)$/.test(file) ||
    /^packages\/.+\.ts$/.test(file) ||
    isWorkspacePackageFile(file) ||
    file === "pnpm-lock.yaml"
  );
}

export function buildPreCommitPlan(files) {
  const stagedFiles = [...new Set(files.map(normalizeRepoPath).filter(Boolean))];
  const prettierFiles = stagedFiles.filter(isPrettierTarget);
  const lintFiles = stagedFiles.filter(isLintTarget);
  return { stagedFiles, commands: commandsFor(stagedFiles, prettierFiles, lintFiles) };
}

function commandsFor(stagedFiles, prettierFiles, lintFiles) {
  const commands = [command("staged whitespace check", "git", ["diff", "--cached", "--check"])];
  pushFileCommand(commands, prettierFiles, "prettier on staged files", [
    "exec",
    "prettier",
    "--check",
  ]);
  pushFileCommand(commands, lintFiles, "eslint on staged files", [
    "exec",
    "eslint",
    "--no-warn-ignored",
  ]);
  pushConditionalCommand(
    commands,
    stagedFiles.some(needsTypecheck),
    "TypeScript project references",
    ["typecheck"],
  );
  pushConditionalCommand(
    commands,
    stagedFiles.some(needsCollabTypecheck),
    "collaboration service typecheck",
    ["--filter", "@rme/collab", "typecheck"],
  );
  pushConditionalCommand(
    commands,
    stagedFiles.some(needsArchitectureCheck),
    "architecture boundary check",
    ["arch:check"],
  );
  pushConditionalCommand(commands, stagedFiles.some(needsDocsCheck), "docs integrity check", [
    "docs:check",
  ]);
  pushConditionalCommand(commands, stagedFiles.some(needsTest), "workspace tests", ["test"]);
  return commands;
}

function command(label, executable, args) {
  return { label, command: executable, args };
}

function pushFileCommand(commands, files, label, args) {
  if (files.length > 0) commands.push(command(label, "pnpm", [...args, ...files]));
}

function pushConditionalCommand(commands, shouldRun, label, args) {
  if (shouldRun) commands.push(command(label, "pnpm", args));
}

function stagedFilesFromGit() {
  const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMRD"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout.split("\n");
}

function runCommand(command) {
  console.log(`pre-commit: ${command.label}`);
  const result = spawnSync(command.command, command.args, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const stagedFiles = stagedFilesFromGit();
  const plan = buildPreCommitPlan(stagedFiles);

  if (plan.stagedFiles.length === 0) {
    console.log("pre-commit: no staged files");
    return;
  }

  for (const command of plan.commands) {
    runCommand(command);
  }
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main();
}
