#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  localProductPassword,
  localProductPasswordHash,
  localProductPasswordSalt,
  localProductSeedSpec,
} from "./product-seed-spec.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");
const folders = [
  folder(
    localProductSeedSpec.workspace.rootFolderId,
    null,
    null,
    "Workspace root",
    "workspaceRoot",
  ),
  folder(
    localProductSeedSpec.project.rootFolderId,
    localProductSeedSpec.project.id,
    null,
    "Project root",
    "projectRoot",
  ),
];

loadLocalEnv();
assertLocalSeedTarget();

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const prisma = new PrismaClient();

try {
  await seedLocalProductData();
  console.log(
    `Seeded local product workspace "${localProductSeedSpec.workspace.name}" for ${localProductSeedSpec.members
      .map((item) => item.email)
      .join(", ")} with password '${localProductPassword}'.`,
  );
} finally {
  await prisma.$disconnect();
}

async function seedLocalProductData() {
  await seedWorkspaceScaffold();
  await seedEach(localProductSeedSpec.members, seedMember);
  await seedEach(localProductSeedSpec.documents, seedDocument);
  await seedEach(localProductSeedSpec.documentProperties, seedDocumentProperty);
  await seedEach(localProductSeedSpec.linkEdges, seedLinkEdge);
}

async function seedWorkspaceScaffold() {
  await upsertWorkspace();
  await upsertFolder(folders[0]);
  await attachRootFolder(
    "workspace",
    localProductSeedSpec.workspace.id,
    localProductSeedSpec.workspace.rootFolderId,
  );
  await upsertProject();
  await upsertFolder(folders[1]);
  await attachRootFolder(
    "project",
    localProductSeedSpec.project.id,
    localProductSeedSpec.project.rootFolderId,
  );
}

async function upsertWorkspace() {
  await prisma.workspace.upsert({
    where: { id: localProductSeedSpec.workspace.id },
    update: { name: localProductSeedSpec.workspace.name },
    create: {
      id: localProductSeedSpec.workspace.id,
      name: localProductSeedSpec.workspace.name,
    },
  });
}

async function upsertProject() {
  await prisma.project.upsert({
    where: { id: localProductSeedSpec.project.id },
    update: { name: localProductSeedSpec.project.name },
    create: {
      id: localProductSeedSpec.project.id,
      workspaceId: localProductSeedSpec.workspace.id,
      name: localProductSeedSpec.project.name,
    },
  });
}

async function attachRootFolder(model, id, rootFolderId) {
  await prisma[model].update({
    where: { id },
    data: { rootFolderId },
  });
}

async function upsertFolder(folderData) {
  await prisma.folder.upsert({
    where: { id: folderData.id },
    update: { name: folderData.name, deletedAt: null },
    create: folderData,
  });
}

async function seedMember(workspaceMember) {
  const userData = userUpsertData(workspaceMember);
  const seededUser = await prisma.user.upsert({
    where: { email: workspaceMember.email },
    update: userData,
    create: { id: workspaceMember.userId, email: workspaceMember.email, ...userData },
  });
  const membershipData = membershipUpsertData(workspaceMember, seededUser.id);
  await prisma.workspaceMembership.upsert({
    where: { id: workspaceMember.membershipId },
    update: membershipData,
    create: { id: workspaceMember.membershipId, ...membershipData },
  });
}

async function seedDocument(seededDocument) {
  const documentData = documentUpsertData(seededDocument);
  await prisma.document.upsert({
    where: { id: seededDocument.id },
    update: documentData,
    create: {
      id: seededDocument.id,
      markdownBodyRef: `documents/${seededDocument.id}/current.md`,
      ...documentData,
    },
  });
}

async function seedDocumentProperty(documentProperty) {
  await prisma.documentProperty.upsert({
    where: { documentId_key: pickDocumentPropertyKey(documentProperty) },
    update: pickDocumentPropertyData(documentProperty),
    create: documentProperty,
  });
}

async function seedLinkEdge(linkEdge) {
  await prisma.linkEdge.upsert({
    where: { sourceDocumentId_targetDocumentId_markdownHref: pickLinkEdgeKey(linkEdge) },
    update: { preview: linkEdge.preview },
    create: linkEdge,
  });
}

async function seedEach(items, seedItem) {
  for (const item of items) {
    await seedItem(item);
  }
}

function folder(id, projectId, parentFolderId, name, kind) {
  return {
    id,
    workspaceId: localProductSeedSpec.workspace.id,
    projectId,
    parentFolderId,
    name,
    kind,
  };
}

function userUpsertData(workspaceMember) {
  return {
    name: workspaceMember.displayName,
    passwordHash: localProductPasswordHash,
    passwordSalt: localProductPasswordSalt,
  };
}

function membershipUpsertData(workspaceMember, userId) {
  return {
    userId,
    workspaceId: localProductSeedSpec.workspace.id,
    displayName: workspaceMember.displayName,
    color: workspaceMember.color,
    role: workspaceMember.role,
    removedAt: null,
  };
}

function documentUpsertData(seededDocument) {
  return {
    folderId: localProductSeedSpec.project.rootFolderId,
    title: seededDocument.title,
    state: seededDocument.state,
    archivedAt: null,
    markdownBody: readSeedMarkdown(seededDocument),
    contentSource: "manualImport",
  };
}

function readSeedMarkdown(seededDocument) {
  return readFileSync(join(repoRoot, seededDocument.sourcePath), "utf8");
}

function pickDocumentPropertyKey(documentProperty) {
  return { documentId: documentProperty.documentId, key: documentProperty.key };
}

function pickDocumentPropertyData(documentProperty) {
  return { type: documentProperty.type, value: documentProperty.value };
}

function pickLinkEdgeKey(linkEdge) {
  return {
    sourceDocumentId: linkEdge.sourceDocumentId,
    targetDocumentId: linkEdge.targetDocumentId,
    markdownHref: linkEdge.markdownHref,
  };
}

function loadLocalEnv() {
  for (const envFile of [".env.local", ".env"]) {
    const envPath = join(repoRoot, envFile);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/u)) {
      loadEnvLine(line);
    }
  }
}

function loadEnvLine(line) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/u);
  if (!match || process.env[match[1]] !== undefined) return;
  process.env[match[1]] = stripEnvQuotes(match[2].trim());
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function assertLocalSeedTarget() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed local product data with NODE_ENV=production.");
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;
  const host = databaseHost(databaseUrl);
  if (host && !["127.0.0.1", "localhost"].includes(host)) {
    throw new Error("Refusing to seed local product data against a non-local database host.");
  }
}

function databaseHost(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return null;
  }
}
