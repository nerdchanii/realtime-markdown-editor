import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { DocumentPropertyValue } from "@/modules/documents/domain/document-property.js";
import { createDocument } from "@/modules/documents/domain/document.js";
import type { FolderId } from "@/modules/documents/domain/references.js";
import type { RevisionId } from "@rme/contracts";

import { PrismaDocumentContentRepository } from "./prisma-document-content-repository.js";
import { PrismaDocumentRepository } from "./prisma-document-repository.js";

test("PrismaDocumentRepository persists document metadata and owned properties", async () => {
  const client = new FakeDocumentPersistenceClient();
  const repository = new PrismaDocumentRepository(client);
  const document = createDocument({
    id: "document_a" as ReturnType<typeof createDocument>["id"],
    folderId: "folder_a" as FolderId,
    title: "Launch plan",
    markdownBodyRef: "documents/document_a/current.md",
    properties: [
      { key: "Status", value: { type: "status", value: "review" } },
      { key: "Owner", value: { type: "member", value: "member_alice" as never } },
    ],
  });

  await repository.save(document);
  const found = await repository.findById(document.id);

  assert.deepEqual(found, document);
  assert.equal(client.deletedDocumentId, document.id);
  assert.deepEqual(
    client.propertyRows.map((row) => [row.key, row.value]),
    document.properties.map((property) => [property.key, property.value]),
  );
});

test("PrismaDocumentContentRepository saves and reads the latest Markdown projection", async () => {
  const updatedAt = new Date("2026-04-30T12:00:00.000Z");
  const client = new FakeDocumentContentPersistenceClient(updatedAt);
  const repository = new PrismaDocumentContentRepository(client);

  await repository.saveCurrentContent({
    documentId: "document_a" as ReturnType<typeof createDocument>["id"],
    markdownBody: "# Current\n\nPersisted projection.",
    latestRevisionId: "revision_a" as RevisionId,
    source: "collaboration-projection",
  });

  assert.deepEqual(await repository.findCurrentContent("document_a" as never), {
    documentId: "document_a",
    markdownBody: "# Current\n\nPersisted projection.",
    latestRevisionId: "revision_a",
    updatedAt,
  });
});

type StoredDocumentRow = Readonly<{
  id: string;
  folderId: string;
  title: string;
  markdownBodyRef: string;
  state: string;
  properties?: readonly StoredPropertyRow[];
}>;

type StoredPropertyRow = Readonly<{
  documentId: string;
  key: string;
  type: string;
  value: DocumentPropertyValue;
}>;

class FakeDocumentPersistenceClient {
  readonly propertyRows: StoredPropertyRow[] = [];
  deletedDocumentId: string | null = null;
  private documentRow: StoredDocumentRow | null = null;

  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      if (this.documentRow?.id !== where.id) return null;
      return { ...this.documentRow, properties: this.propertyRows };
    },
    upsert: async ({
      create,
      update,
    }: {
      where: { id: string };
      create: StoredDocumentRow;
      update: Omit<StoredDocumentRow, "id" | "properties">;
    }) => {
      this.documentRow = {
        ...create,
        ...update,
        id: create.id,
      };
      return this.documentRow;
    },
  };

  readonly documentProperty = {
    deleteMany: async ({ where }: { where: { documentId: string } }) => {
      this.deletedDocumentId = where.documentId;
      this.propertyRows.splice(0, this.propertyRows.length);
    },
    create: async ({ data }: { data: StoredPropertyRow }) => {
      this.propertyRows.push(data);
      return data;
    },
  };

  async $transaction<T>(callback: (client: this) => Promise<T>): Promise<T> {
    return callback(this);
  }
}

type StoredDocumentContentRow = Readonly<{
  id: string;
  markdownBody: string;
  latestRevisionId: string | null;
  markdownBodyUpdatedAt: Date;
  archivedAt: Date | null;
}>;

class FakeDocumentContentPersistenceClient {
  private contentRow: StoredDocumentContentRow | null = null;

  constructor(private readonly updatedAt: Date) {}

  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      if (this.contentRow?.id !== where.id) return null;
      return this.contentRow;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { markdownBody: string; latestRevisionId?: string | null; contentSource: string };
    }) => {
      this.contentRow = {
        id: where.id,
        markdownBody: data.markdownBody,
        latestRevisionId: data.latestRevisionId ?? null,
        markdownBodyUpdatedAt: this.updatedAt,
        archivedAt: null,
      };
      return this.contentRow;
    },
  };
}
