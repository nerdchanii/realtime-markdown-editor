#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), "..");

const localProductPasswordSalt = "local-review-password-salt";
const localProductPasswordHash =
  "3bbff257761674495c3ad315d62259d7d7f1b13901c9c63eac6cb9bf189cc2f49d5254e6f2858b69cf2ac9cae04982f423a3253b239d3c450cb8c72785057e81";

const workspaceFixture = {
  workspaceId: "workspace_review",
  workspaceName: "Review Team Workspace",
  workspaceRootFolderId: "folder_workspace_root",
  projectId: "project_editor",
  projectName: "Editor Review",
  projectRootFolderId: "folder_project_root",
};

const folders = [
  [workspaceFixture.workspaceRootFolderId, null, null, "Workspace root", "workspaceRoot"],
  [
    workspaceFixture.projectRootFolderId,
    workspaceFixture.projectId,
    null,
    "Project root",
    "projectRoot",
  ],
].map(folder);

const members = [
  member("user_alice", "alice@example.test", "member_alice", "Alice", "#0969da", "owner"),
  member("user_bob", "bob@example.test", "member_bob", "Bob", "#1a7f37", "member"),
  member("user_carol", "carol@example.test", "member_carol", "Carol", "#8250df", "member"),
  member("user_dana", "dana@example.test", "member_dana", "Dana", "#bf3989", "member"),
];

const documents = [
  documentFixture(
    "document_review_plan",
    "Review Plan",
    "review",
    "# Review Plan\n\nThis document keeps product properties outside the Markdown body.",
  ),
  documentFixture(
    "document_decision_log",
    "Decision Log",
    "saved",
    "# Decision Log\n\nLinks to [Review Plan](./review-plan.md).",
  ),
];

const documentProperties = [
  property("document_review_plan", "Status", "status", { type: "status", value: "In Review" }),
  property("document_review_plan", "Owner", "member", { type: "member", value: "member_alice" }),
];

const linkEdges = [
  {
    sourceDocumentId: "document_decision_log",
    targetDocumentId: "document_review_plan",
    markdownHref: "./review-plan.md",
    preview: "Decision Log references the current review plan.",
  },
];

loadLocalEnv();
assertLocalSeedTarget();

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const prisma = new PrismaClient();

try {
  await seedReviewerProductFixture();
  console.log(
    `Seeded local product accounts ${members.map((item) => item.email).join(", ")} with password 'password'.`,
  );
} finally {
  await prisma.$disconnect();
}

async function seedReviewerProductFixture() {
  await seedWorkspaceScaffold();
  await seedEach(members, seedMember);
  await seedEach(documents, seedDocument);
  await seedEach(documentProperties, seedDocumentProperty);
  await seedEach(linkEdges, seedLinkEdge);
}

async function seedWorkspaceScaffold() {
  await upsertWorkspace();
  await upsertFolder(folders[0]);
  await attachRootFolder(
    "workspace",
    workspaceFixture.workspaceId,
    workspaceFixture.workspaceRootFolderId,
  );
  await upsertProject();
  await upsertFolder(folders[1]);
  await attachRootFolder(
    "project",
    workspaceFixture.projectId,
    workspaceFixture.projectRootFolderId,
  );
}

async function upsertWorkspace() {
  await prisma.workspace.upsert({
    where: { id: workspaceFixture.workspaceId },
    update: { name: workspaceFixture.workspaceName },
    create: { id: workspaceFixture.workspaceId, name: workspaceFixture.workspaceName },
  });
}

async function upsertProject() {
  await prisma.project.upsert({
    where: { id: workspaceFixture.projectId },
    update: { name: workspaceFixture.projectName },
    create: {
      id: workspaceFixture.projectId,
      workspaceId: workspaceFixture.workspaceId,
      name: workspaceFixture.projectName,
    },
  });
}

async function attachRootFolder(model, id, rootFolderId) {
  await prisma[model].update({
    where: { id },
    data: { rootFolderId },
  });
}

async function upsertFolder(folder) {
  await prisma.folder.upsert({
    where: { id: folder.id },
    update: { name: folder.name, deletedAt: null },
    create: folder,
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

function folder([id, projectId, parentFolderId, name, kind]) {
  return { id, workspaceId: workspaceFixture.workspaceId, projectId, parentFolderId, name, kind };
}

function member(userId, email, membershipId, displayName, color, role) {
  return { userId, email, membershipId, displayName, color, role };
}

function documentFixture(id, title, state, markdownBody) {
  return { id, title, state, markdownBody };
}

function property(documentId, key, type, value) {
  return { documentId, key, type, value };
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
    workspaceId: workspaceFixture.workspaceId,
    displayName: workspaceMember.displayName,
    color: workspaceMember.color,
    role: workspaceMember.role,
  };
}

function documentUpsertData(seededDocument) {
  return {
    folderId: workspaceFixture.projectRootFolderId,
    title: seededDocument.title,
    state: seededDocument.state,
    archivedAt: null,
    markdownBody: seededDocument.markdownBody,
    contentSource: "manualImport",
  };
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
}
