import { strict as assert } from "node:assert";
import { test } from "node:test";

import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { DocumentId, WorkspaceId } from "@rme/contracts";

import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import type {
  AuthSessionRepository,
  SessionContext,
} from "@/modules/identity/use-cases/auth-session-service.js";
import { AuthSessionService } from "@/modules/identity/use-cases/auth-session-service.js";
import type { PrismaDatabaseService } from "@/database/database.service.js";

test("product API access requires a valid session cookie", async () => {
  const service = createAccessService({ session: null });

  await assert.rejects(
    () => service.requireWorkspaceAccess(undefined, "workspace_a" as WorkspaceId),
    (error) => error instanceof UnauthorizedException,
  );
});

test("product API access rejects sessions outside the target workspace", async () => {
  const service = createAccessService({
    session: sessionForWorkspace("workspace_a"),
  });

  await assert.rejects(
    () => service.requireWorkspaceAccess("rme_session=session_token", "workspace_b" as WorkspaceId),
    (error) => error instanceof ForbiddenException,
  );
});

test("product API access resolves document workspace before allowing current membership authorship", async () => {
  const service = createAccessService({
    session: sessionForWorkspace("workspace_a"),
    database: {
      documentWorkspaceIds: new Map([["document_b", "workspace_b"]]),
    },
  });

  await assert.rejects(
    () =>
      service.requireCurrentMembershipForDocument(
        "rme_session=session_token",
        "document_b" as DocumentId,
      ),
    (error) => error instanceof ForbiddenException,
  );
});

test("product API access reports missing resource owners as not found", async () => {
  const service = createAccessService({
    session: sessionForWorkspace("workspace_a"),
  });

  await assert.rejects(
    () =>
      service.requireDocumentAccess("rme_session=session_token", "document_missing" as DocumentId),
    (error) => error instanceof NotFoundException,
  );
});

function createAccessService(input: {
  session: SessionContext | null;
  database?: Partial<FakeDatabaseState>;
}): ProductApiAccessService {
  return new ProductApiAccessService(
    new AuthSessionService(new FakeAuthSessionRepository(input.session)),
    new FakePrismaDatabaseService(input.database) as unknown as PrismaDatabaseService,
  );
}

class FakeAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly session: SessionContext | null) {}

  async createSession(): Promise<never> {
    throw new Error("not used");
  }

  async findSessionByToken(token: string): Promise<SessionContext | null> {
    return token === "session_token" ? this.session : null;
  }

  async revokeSessionByToken(): Promise<boolean> {
    return false;
  }
}

type FakeDatabaseState = Readonly<{
  projectWorkspaceIds: ReadonlyMap<string, string>;
  folderWorkspaceIds: ReadonlyMap<string, string>;
  documentWorkspaceIds: ReadonlyMap<string, string>;
  checkpointDocumentIds: ReadonlyMap<string, string>;
}>;

class FakePrismaDatabaseService {
  private readonly state: FakeDatabaseState;

  constructor(input: Partial<FakeDatabaseState> = {}) {
    this.state = {
      projectWorkspaceIds: input.projectWorkspaceIds ?? new Map(),
      folderWorkspaceIds: input.folderWorkspaceIds ?? new Map(),
      documentWorkspaceIds: input.documentWorkspaceIds ?? new Map(),
      checkpointDocumentIds: input.checkpointDocumentIds ?? new Map(),
    };
  }

  readonly project = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const workspaceId = this.state.projectWorkspaceIds.get(where.id);
      return workspaceId ? { workspaceId } : null;
    },
  };

  readonly folder = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const workspaceId = this.state.folderWorkspaceIds.get(where.id);
      return workspaceId ? { workspaceId, deletedAt: null } : null;
    },
  };

  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const workspaceId = this.state.documentWorkspaceIds.get(where.id);
      return workspaceId ? { folder: { workspaceId } } : null;
    },
  };

  readonly checkpoint = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const documentId = this.state.checkpointDocumentIds.get(where.id);
      return documentId ? { documentId } : null;
    },
  };
}

function sessionForWorkspace(workspaceId: string): SessionContext {
  return {
    user: { id: "user_alice" as never, email: "alice@example.test", name: "Alice" },
    memberships: [
      {
        id: "member_alice" as never,
        userId: "user_alice" as never,
        workspaceId: workspaceId as never,
        displayName: "Alice",
        color: "#0969da",
        role: "owner",
      },
    ],
    currentMembership: {
      id: "member_alice" as never,
      userId: "user_alice" as never,
      workspaceId: workspaceId as never,
      displayName: "Alice",
      color: "#0969da",
      role: "owner",
    },
  };
}
