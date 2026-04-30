/* eslint-disable max-lines-per-function */

import "reflect-metadata";

import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type {
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentDetailDto,
  DocumentPropertyDto,
  DocumentResponseDto,
  DocumentSummaryDto,
  ListDocumentsResponseDto,
} from "@rme/contracts";

import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";
import { DocumentsProductController } from "@/modules/documents/interfaces/documents-product.controller.js";
import {
  DOCUMENT_PRODUCT_REPOSITORY,
  type DocumentProductRepository,
} from "@/modules/documents/ports/document-product-repository.js";
import { DocumentProductService } from "@/modules/documents/use-cases/document-product-service.js";

test("document product API keeps one folder location and stores properties outside Markdown", async () => {
  const repository = new InMemoryDocumentProductRepository();

  @Module({
    controllers: [DocumentsProductController],
    providers: [
      DocumentProductService,
      { provide: DOCUMENT_PRODUCT_REPOSITORY, useValue: repository },
    ],
  })
  class ProductDocumentApiTestModule {}

  const app = await NestFactory.create(ProductDocumentApiTestModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    const baseUrl = baseUrlForApp(app);
    const created = await postJson<DocumentResponseDto>(baseUrl, "/folders/folder_a/documents", {
      title: "Launch checklist",
      initialMarkdownBody: "# Launch checklist\n\n- Ship API",
      properties: [{ key: "Status", value: { type: "status", value: "review" } }],
    });

    assert.equal(created.document.folderId, "folder_a");
    assert.equal(created.document.markdownBody, "# Launch checklist\n\n- Ship API");
    assert.deepEqual(created.document.properties, [
      { key: "Status", value: { type: "status", value: "review" } },
    ]);

    const moved = await postJson<DocumentResponseDto>(
      baseUrl,
      `/documents/${created.document.id}/move`,
      { targetFolderId: "folder_b" },
    );
    assert.equal(moved.document.folderId, "folder_b");

    const folderA = await getJson<ListDocumentsResponseDto>(baseUrl, "/folders/folder_a/documents");
    const folderB = await getJson<ListDocumentsResponseDto>(baseUrl, "/folders/folder_b/documents");
    assert.deepEqual(
      folderA.documents.map((document) => document.id),
      [],
    );
    assert.deepEqual(
      folderB.documents.map((document) => document.id),
      [created.document.id],
    );

    const replaced = await putJson<DocumentResponseDto>(
      baseUrl,
      `/documents/${created.document.id}/properties`,
      {
        properties: [{ key: "Owner", value: { type: "text", value: "API" } }],
      },
    );
    assert.equal(replaced.document.markdownBody, "# Launch checklist\n\n- Ship API");
    assert.deepEqual(replaced.document.properties, [
      { key: "Owner", value: { type: "text", value: "API" } },
    ]);

    const connections = await getJson<DocumentConnectionsResponseDto>(
      baseUrl,
      `/documents/${created.document.id}/connections`,
    );
    assert.deepEqual(connections, {
      documentId: created.document.id,
      links: [],
      backlinks: [],
    });
  } finally {
    await app.close();
  }
});

class InMemoryDocumentProductRepository implements DocumentProductRepository {
  private readonly folderIds = new Set(["folder_a", "folder_b"]);
  private readonly documents = new Map<string, DocumentDetailDto & { archivedAt?: string }>();
  private next = 1;

  async listByFolder(folderId: string): Promise<readonly DocumentSummaryDto[] | null> {
    if (!this.folderIds.has(folderId)) return null;
    return [...this.documents.values()]
      .filter((document) => document.folderId === folderId && !document.archivedAt)
      .map(toSummary);
  }

  async createInFolder(
    folderId: string,
    input: CreateDocumentRequestDto,
  ): Promise<DocumentDetailDto | null> {
    if (!this.folderIds.has(folderId)) return null;
    const id = `document_${this.next++}`;
    const document = {
      id,
      folderId,
      title: input.title,
      state: input.state ?? "draft",
      latestRevisionId: null,
      publishedRevisionId: null,
      markdownBody: input.initialMarkdownBody ?? "",
      properties: input.properties ?? [],
    } as DocumentDetailDto;
    this.documents.set(id, document);
    return document;
  }

  async findDetail(documentId: string): Promise<DocumentDetailDto | null> {
    const document = this.documents.get(documentId);
    return document && !document.archivedAt ? document : null;
  }

  async updateDocument(
    documentId: string,
    input: { title?: string; state?: DocumentDetailDto["state"] },
  ): Promise<DocumentDetailDto | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    const updated = {
      ...document,
      title: input.title ?? document.title,
      state: input.state ?? document.state,
    };
    this.documents.set(documentId, updated);
    return updated;
  }

  async moveDocument(
    documentId: string,
    targetFolderId: string,
  ): Promise<DocumentDetailDto | null> {
    const document = await this.findDetail(documentId);
    if (!document || !this.folderIds.has(targetFolderId)) return null;
    const updated = { ...document, folderId: targetFolderId as DocumentDetailDto["folderId"] };
    this.documents.set(documentId, updated);
    return updated;
  }

  async deleteDocument(documentId: string): Promise<DeletedResourceResponseDto | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    const deletedAt = new Date("2026-04-30T00:00:00.000Z").toISOString();
    this.documents.set(documentId, { ...document, archivedAt: deletedAt });
    return { id: documentId, deletedAt };
  }

  async findContent(documentId: string): Promise<DocumentContentResponseDto["content"] | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    return {
      documentId: document.id,
      markdownBody: document.markdownBody,
      latestRevisionId: document.latestRevisionId,
      updatedAt: "2026-04-30T00:00:00.000Z",
    };
  }

  async updateContent(
    documentId: string,
    input: { markdownBody: string; baseRevisionId?: string },
  ): Promise<DocumentContentResponseDto["content"] | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    const updated = {
      ...document,
      markdownBody: input.markdownBody,
      latestRevisionId:
        (input.baseRevisionId as DocumentDetailDto["latestRevisionId"]) ??
        document.latestRevisionId,
    };
    this.documents.set(documentId, updated);
    return this.findContent(documentId);
  }

  async replaceProperties(
    documentId: string,
    properties: readonly DocumentPropertyDto[],
  ): Promise<DocumentDetailDto | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    const updated = { ...document, properties };
    this.documents.set(documentId, updated);
    return updated;
  }

  async getConnections(documentId: string): Promise<DocumentConnectionsResponseDto | null> {
    const document = await this.findDetail(documentId);
    if (!document) return null;
    return { documentId: document.id, links: [], backlinks: [] };
  }
}

function toSummary(document: DocumentDetailDto): DocumentSummaryDto {
  return {
    id: document.id,
    folderId: document.folderId,
    title: document.title,
    state: document.state,
    latestRevisionId: document.latestRevisionId,
    publishedRevisionId: document.publishedRevisionId,
  };
}

async function postJson<T>(baseUrl: string, path: string, body: object): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  assert.equal(response.status, 201, responseText);
  return JSON.parse(responseText) as T;
}

async function putJson<T>(baseUrl: string, path: string, body: object): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  return JSON.parse(responseText) as T;
}

async function getJson<T>(baseUrl: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  return JSON.parse(responseText) as T;
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
