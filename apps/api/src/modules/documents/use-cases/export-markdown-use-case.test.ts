import { strict as assert } from "node:assert";
import { test } from "node:test";

import { createDocument, type DocumentId } from "@/modules/documents/domain/document.js";
import type { FolderId } from "@/modules/documents/domain/references.js";
import type { DocumentContentRepository } from "@/modules/documents/ports/document-content-repository.js";
import type { DocumentRepository } from "@/modules/documents/ports/document-repository.js";

import { ExportMarkdownUseCase } from "./export-markdown-use-case.js";

test("ExportMarkdownUseCase resolves export identity, properties, and Markdown server-side", async () => {
  const documentId = "document_a" as DocumentId;
  const documents = new FakeDocumentRepository(documentId);
  const contents = new FakeDocumentContentRepository(documentId);
  const useCase = new ExportMarkdownUseCase(documents, contents);

  const exported = await useCase.execute({
    documentId,
    filename: "release-notes",
  });

  assert.equal(exported.documentId, documentId);
  assert.equal(exported.filename, "release-notes.md");
  assert.equal(exported.markdownBody, "# Release notes\n\nResolved by server.");
  assert.deepEqual(exported.frontmatter, {
    Owner: "member_alice",
    Status: "review",
  });
  assert.match(exported.fileContents, /^---\nOwner: member_alice\nStatus: review\n---/);
});

class FakeDocumentRepository implements DocumentRepository {
  constructor(private readonly documentId: DocumentId) {}

  async findById(id: DocumentId) {
    if (id !== this.documentId) return null;
    return createDocument({
      id,
      folderId: "folder_a" as FolderId,
      title: "Release notes",
      markdownBodyRef: "documents/document_a/current.md",
      properties: [
        { key: "Owner", value: { type: "member", value: "member_alice" as never } },
        { key: "Status", value: { type: "status", value: "review" } },
      ],
    });
  }

  async save(): Promise<void> {}
}

class FakeDocumentContentRepository implements DocumentContentRepository {
  constructor(private readonly documentId: DocumentId) {}

  async findCurrentContent(id: DocumentId) {
    if (id !== this.documentId) return null;
    return {
      documentId: id,
      markdownBody: "# Release notes\n\nResolved by server.",
      latestRevisionId: null,
      updatedAt: new Date("2026-04-30T12:00:00.000Z"),
    };
  }

  async saveCurrentContent(): Promise<never> {
    throw new Error("not used");
  }
}
