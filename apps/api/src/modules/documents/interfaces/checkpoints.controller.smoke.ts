import "reflect-metadata";

import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type {
  CreateCheckpointResponseDto,
  ListCheckpointsResponseDto,
  CheckpointSnapshotInspectDto,
} from "@rme/contracts";

import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";
import {
  LocalCheckpointSnapshotArtifactStorage,
  type CheckpointArtifactPersistenceClient,
} from "@/modules/artifacts/adapters/local-checkpoint-snapshot-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import {
  PrismaCheckpointRepository,
  type PrismaCheckpointPersistenceClient,
} from "@/modules/documents/adapters/prisma-checkpoint-repository.js";
import { CheckpointsController } from "@/modules/documents/interfaces/checkpoints.controller.js";
import type {
  DocumentContentRepository,
  SaveDocumentContentInput,
} from "@/modules/documents/ports/document-content-repository.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
import { ListCheckpointsUseCase } from "@/modules/documents/use-cases/list-checkpoints-use-case.js";
import type { SessionContext } from "@/modules/identity/use-cases/auth-session-service.js";
import { AuthSessionService } from "@/modules/identity/use-cases/auth-session-service.js";

test("checkpoint API creates, lists, and inspects persisted document checkpoints", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-checkpoint-api-"));
  const client = new FakeCheckpointApiPersistenceClient();
  const content = new FakeDocumentContentRepository();
  const artifactStorage = new LocalCheckpointSnapshotArtifactStorage(client, dataDir);
  const repository = new PrismaCheckpointRepository(client, artifactStorage);
  const authSessions = new AuthSessionService(new FakeAuthSessionRepository());
  await content.saveCurrentContent({
    documentId: "document_api" as DocumentId,
    markdownBody: "# API checkpoint\n\nVisible after list.",
    source: "collaboration-projection",
  });
  await content.saveCurrentContent({
    documentId: "document_other" as DocumentId,
    markdownBody: "Other body",
    source: "collaboration-projection",
  });

  try {
    const firstApp = await createCheckpointApiApp({ repository, content, authSessions });
    try {
      await assertCheckpointApiCreateFlow(baseUrlForApp(firstApp));
    } finally {
      await firstApp.close();
    }

    const restartedApp = await createCheckpointApiApp({ repository, content, authSessions });
    try {
      await assertCheckpointApiInspectFlow(baseUrlForApp(restartedApp), client.createdCheckpointId);
    } finally {
      await restartedApp.close();
    }
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

async function assertCheckpointApiCreateFlow(baseUrl: string): Promise<void> {
  const markdownSnapshot = "# API checkpoint\n\nVisible after list.";
  const created = await createCheckpoint(baseUrl, "document_api", {
    message: "API durable checkpoint",
  });
  await createCheckpoint(baseUrl, "document_other", {
    message: "Other document",
  });

  await assertDocumentCheckpointList(baseUrl, created);
  const inspected = await inspectCheckpoint(baseUrl, created.checkpoint.id);
  assert.equal(inspected.markdownBody, markdownSnapshot);
}

async function assertCheckpointApiInspectFlow(
  baseUrl: string,
  checkpointId: string | null,
): Promise<void> {
  assert.ok(checkpointId);
  const list = await fetchCheckpointList(baseUrl, "document_api");
  const inspected = await inspectCheckpoint(baseUrl, checkpointId);

  assert.equal(list.checkpoints.length, 1);
  assert.equal(list.checkpoints[0]?.id, checkpointId);
  assert.equal(inspected.markdownBody, "# API checkpoint\n\nVisible after list.");
}

async function assertDocumentCheckpointList(
  baseUrl: string,
  created: CreateCheckpointResponseDto,
): Promise<void> {
  const list = await fetchCheckpointList(baseUrl, "document_api");

  assert.equal(list.checkpoints.length, 1);
  assert.equal(list.checkpoints[0]?.id, created.checkpoint.id);
  assert.equal(list.checkpoints[0]?.revisionId, created.checkpoint.revisionId);
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
    message: string;
  }>,
): Promise<CreateCheckpointResponseDto> {
  const response = await fetch(
    `${baseUrl}/documents/${encodeURIComponent(documentId)}/checkpoints`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "rme_session=session_token" },
      body: JSON.stringify({
        message: input.message,
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

async function createCheckpointApiApp(input: {
  repository: PrismaCheckpointRepository;
  content: DocumentContentRepository;
  authSessions: AuthSessionService;
}) {
  @Module({
    controllers: [CheckpointsController],
    providers: [
      {
        provide: CreateCheckpointUseCase,
        useValue: new CreateCheckpointUseCase(input.repository, input.content),
      },
      {
        provide: InspectCheckpointSnapshotUseCase,
        useValue: new InspectCheckpointSnapshotUseCase(input.repository),
      },
      {
        provide: ListCheckpointsUseCase,
        useValue: new ListCheckpointsUseCase(input.repository),
      },
      { provide: AuthSessionService, useValue: input.authSessions },
    ],
  })
  class CheckpointApiTestModule {}

  const app = await NestFactory.create(CheckpointApiTestModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);
  return app;
}

class FakeDocumentContentRepository implements DocumentContentRepository {
  private readonly content = new Map<string, string>();

  async findCurrentContent(documentId: DocumentId) {
    const markdownBody = this.content.get(documentId);
    if (markdownBody === undefined) return null;
    return {
      documentId,
      markdownBody,
      latestRevisionId: null,
      updatedAt: new Date("2026-04-30T12:00:00.000Z"),
    };
  }

  async saveCurrentContent(input: SaveDocumentContentInput) {
    this.content.set(input.documentId, input.markdownBody);
    return {
      documentId: input.documentId,
      markdownBody: input.markdownBody,
      latestRevisionId: null,
      updatedAt: new Date("2026-04-30T12:00:00.000Z"),
    };
  }
}

class FakeAuthSessionRepository {
  async createSession(): Promise<never> {
    throw new Error("not used");
  }

  async findSessionByToken(token: string): Promise<SessionContext | null> {
    if (token !== "session_token") return null;
    return {
      user: { id: "user_alice" as never, email: "alice@example.test", name: "Alice" },
      memberships: [
        {
          id: "member_alice" as never,
          userId: "user_alice" as never,
          workspaceId: "workspace_a" as never,
          displayName: "Alice",
          color: "#0969da",
          role: "owner",
        },
      ],
      currentMembership: {
        id: "member_alice" as never,
        userId: "user_alice" as never,
        workspaceId: "workspace_a" as never,
        displayName: "Alice",
        color: "#0969da",
        role: "owner",
      },
    };
  }

  async revokeSessionByToken(): Promise<boolean> {
    return false;
  }
}

type RevisionCreateData = Readonly<{
  id: string;
  documentId: string;
  authorMembershipId: string;
  source: "checkpoint";
  message: string;
  snapshotArtifactId: string;
}>;

type CheckpointCreateData = Readonly<{
  id: string;
  documentId: string;
  revisionId: string;
  authorMembershipId: string;
  message: string;
  snapshotArtifactId: string;
}>;

type ArtifactCreateData = Readonly<{
  documentId: string;
  key: string;
  kind: "checkpointSnapshot";
  contentType: "text/markdown; charset=utf-8";
  checksumSha256: string;
  sizeBytes: bigint;
  metadata: {
    workspaceId: string;
    documentId: string;
    checkpointId: string;
    storageKey: string;
  };
}>;

class FakeCheckpointApiPersistenceClient
  implements PrismaCheckpointPersistenceClient, CheckpointArtifactPersistenceClient
{
  createdCheckpointId: string | null = null;
  private readonly checkpoints = new Map<
    string,
    CheckpointCreateData & {
      createdAt: Date;
      snapshotArtifact: { id: string; key: string };
    }
  >();

  readonly revision = {
    create: async ({ data }: { data: RevisionCreateData }) => data,
  };

  readonly checkpoint = {
    create: async ({
      data,
    }: {
      data: CheckpointCreateData;
      include: { snapshotArtifact: true };
    }) => {
      const artifact = this.artifacts.get(data.snapshotArtifactId);
      assert.ok(artifact);
      const checkpoint = {
        ...data,
        createdAt: new Date("2026-04-30T12:00:00.000Z"),
        snapshotArtifact: { id: artifact.id, key: artifact.key },
      };
      if (data.documentId === "document_api") this.createdCheckpointId = data.id;
      this.checkpoints.set(data.id, checkpoint);
      return checkpoint;
    },
    findMany: async ({ where }: { where: { documentId: string } }) =>
      [...this.checkpoints.values()]
        .filter((checkpoint) => checkpoint.documentId === where.documentId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.checkpoints.get(where.id) ?? null,
  };

  private readonly artifacts = new Map<string, ArtifactCreateData & { id: string }>();

  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      folder: { workspaceId: "workspace_a" },
    }),
  };

  readonly artifact = {
    create: async ({ data }: { data: ArtifactCreateData }) => {
      const artifact = { ...data, id: `artifact_${this.artifacts.size + 1}` };
      this.artifacts.set(artifact.id, artifact);
      return artifact;
    },
  };

  async $transaction<T>(callback: (client: this) => Promise<T>): Promise<T> {
    return callback(this);
  }
}
