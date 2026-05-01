import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const requirementsRoot = "docs/requirements";
const requirementDirs = ["completed", "items", "backlog"];

function parseArgs(argv) {
  const filters = {};
  for (let index = 0; index < argv.length; index += 1) {
    index = parseArg(argv, index, filters);
  }
  return filters;
}

function parseArg(argv, index, filters) {
  const arg = argv[index];
  if (arg === "--") return index;
  if (arg === "--json") {
    filters.json = true;
    return index;
  }
  if (!arg.startsWith("--")) {
    throw new Error(`Unexpected argument: ${arg}`);
  }

  return parseFilterArg(argv, index, filters);
}

function parseFilterArg(argv, index, filters) {
  const key = argv[index].slice(2);
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for --${key}`);
  }
  filters[key] = value;
  return index + 1;
}

function walkMarkdownFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return walkMarkdownFiles(path);
    return path.endsWith(".md") && entry !== "README.md" ? [path] : [];
  });
}

function parseFrontmatter(file) {
  const content = readFileSync(file, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const metadata = {};
  let currentListKey = null;

  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trimEnd();
    currentListKey = parseFrontmatterLine(line, metadata, currentListKey);
  }

  return {
    ...metadata,
    path: relative(process.cwd(), file),
  };
}

function parseFrontmatterLine(line, metadata, currentListKey) {
  if (line.startsWith("  - ") && currentListKey) {
    metadata[currentListKey].push(line.slice(4));
    return currentListKey;
  }

  const keyValue = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
  if (!keyValue) return null;

  return setMetadataValue(metadata, keyValue);
}

function setMetadataValue(metadata, keyValue) {
  const [, key, rawValue = ""] = keyValue;
  if (rawValue === "") {
    metadata[key] = [];
    return key;
  }

  metadata[key] = rawValue === "[]" ? [] : rawValue.replace(/^"(.*)"$/, "$1");
  return null;
}

function requirementRecords() {
  return requirementDirs
    .flatMap((dir) => walkMarkdownFiles(join(requirementsRoot, dir)))
    .map(parseFrontmatter)
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

function matchesFilters(record, filters) {
  return ["id", "status", "category", "type", "taskability", "scope"].every((key) => {
    if (!filters[key]) return true;
    return record[key] === filters[key];
  });
}

function printText(records) {
  if (records.length === 0) {
    console.log("No requirements matched.");
    return;
  }

  for (const record of records) {
    console.log(
      [
        record.id,
        `[${record.status}/${record.category}/${record.type}/${record.taskability}/${record.scope}]`,
        record.title,
        record.path,
      ].join(" | "),
    );
  }
}

try {
  const filters = parseArgs(process.argv.slice(2));
  const records = requirementRecords().filter((record) => matchesFilters(record, filters));
  if (filters.json) {
    console.log(JSON.stringify(records, null, 2));
  } else {
    printText(records);
  }
} catch (error) {
  console.error(error.message);
  console.error(
    "Usage: node scripts/requirements-index.mjs [--id ID] [--status STATUS] [--category CATEGORY] [--type TYPE] [--taskability VALUE] [--scope SCOPE] [--json]",
  );
  process.exit(1);
}
