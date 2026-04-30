import "reflect-metadata";

import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { NestFactory } from "@nestjs/core";
import type {
  CreateCheckpointResponseDto,
  ListCheckpointsResponseDto,
  CheckpointSnapshotInspectDto,
} from "@rme/contracts";

import { AppModule } from "@/app.module.js";
import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";

test("checkpoint API creates, lists, and inspects persisted document checkpoints", async () => {
  const previousDataDir = process.env.RME_CHECKPOINT_DATA_DIR;
  const dataDir = await mkdtemp(join(tmpdir(), "rme-checkpoint-api-"));
  process.env.RME_CHECKPOINT_DATA_DIR = dataDir;
  const app = await NestFactory.create(AppModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    await assertCheckpointApiFlow(baseUrlForApp(app));
  } finally {
    await app.close();
    await rm(dataDir, { recursive: true, force: true });
    restoreEnv("RME_CHECKPOINT_DATA_DIR", previousDataDir);
  }
});

async function assertCheckpointApiFlow(baseUrl: string): Promise<void> {
  const markdownSnapshot = "# API checkpoint\n\nVisible after list.";
  const created = await createCheckpoint(baseUrl, "document_api", {
    authorMembershipId: "member_alice",
    message: "API durable checkpoint",
    markdownSnapshot,
  });
  await createCheckpoint(baseUrl, "document_other", {
    authorMembershipId: "member_bob",
    message: "Other document",
    markdownSnapshot: "Other body",
  });

  await assertDocumentCheckpointList(baseUrl, created);
  const inspected = await inspectCheckpoint(baseUrl, created.checkpoint.id);
  assert.equal(inspected.markdownBody, markdownSnapshot);
}

async function assertDocumentCheckpointList(
  baseUrl: string,
  created: CreateCheckpointResponseDto,
): Promise<void> {
  const list = await fetchCheckpointList(baseUrl, "document_api");

  assert.equal(list.checkpoints.length, 1);
  assert.equal(list.checkpoints[0]?.id, created.checkpoint.id);
  assert.equal(list.checkpoints[0]?.authorMembershipId, "member_alice");
  assert.equal(list.checkpoints[0]?.message, "API durable checkpoint");
  assert.equal(list.checkpoints[0]?.snapshotArtifact.contentType, "text/markdown; charset=utf-8");
}

async function fetchCheckpointList(
  baseUrl: string,
  documentId: string,
): Promise<ListCheckpointsResponseDto> {
  const response = await fetch(
    `${baseUrl}/documents/${encodeURIComponent(documentId)}/checkpoints`,
  );
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);

  return JSON.parse(responseText) as ListCheckpointsResponseDto;
}

async function createCheckpoint(
  baseUrl: string,
  documentId: string,
  input: Readonly<{
    authorMembershipId: string;
    message: string;
    markdownSnapshot: string;
  }>,
): Promise<CreateCheckpointResponseDto> {
  const response = await fetch(
    `${baseUrl}/collaboration/documents/${encodeURIComponent(documentId)}/checkpoints`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId,
        authorMembershipId: input.authorMembershipId,
        message: input.message,
        markdownSnapshot: input.markdownSnapshot,
        source: "collaboration",
      }),
    },
  );
  const responseText = await response.text();
  assert.equal(response.status, 201, responseText);

  return JSON.parse(responseText) as CreateCheckpointResponseDto;
}

async function inspectCheckpoint(
  baseUrl: string,
  checkpointId: string,
): Promise<CheckpointSnapshotInspectDto> {
  const response = await fetch(
    `${baseUrl}/documents/checkpoints/${encodeURIComponent(checkpointId)}/snapshot`,
  );
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);

  return JSON.parse(responseText) as CheckpointSnapshotInspectDto;
}

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

function baseUrlForApp(app: Awaited<ReturnType<typeof NestFactory.create>>): string {
  const address = app.getHttpServer().address();
  assertAddressInfo(address);

  return `http://127.0.0.1:${address.port}`;
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
