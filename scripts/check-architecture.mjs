import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const forbiddenPackageDirs = [
  ["packages", "domain"].join("/"),
  ["packages", "application"].join("/"),
  ["packages", "shared"].join("/"),
  ["packages", "utils"].join("/"),
];

const domainImportPattern =
  /from\s+["'](@nestjs|react|@tiptap|prosemirror-|yjs|y-|@hocuspocus|yorkie-js-sdk|@prisma|prisma|aws-sdk|@aws-sdk|ioredis|redis)/;
const nestDecoratorPattern =
  /@(Injectable|Module|Controller|Get|Post|Put|Patch|Delete|WebSocketGateway)\b/;

const failures = [];

for (const dir of forbiddenPackageDirs) {
  if (existsSync(dir)) {
    failures.push(`Forbidden package directory exists: ${dir}`);
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return walk(path);
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return [path];
    return [];
  });
}

for (const file of walk("apps/api/src/modules")) {
  if (!file.includes("/domain/")) continue;
  const content = readFileSync(file, "utf8");
  if (domainImportPattern.test(content)) {
    failures.push(`Domain file imports forbidden framework/provider package: ${file}`);
  }
  if (nestDecoratorPattern.test(content)) {
    failures.push(`Domain file contains Nest/framework decorator: ${file}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
