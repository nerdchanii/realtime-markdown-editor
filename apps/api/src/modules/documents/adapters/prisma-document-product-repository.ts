/* eslint-disable max-lines */

import { randomUUID } from "node:crypto";

import type {
  ArchivedDocumentDto,
  BacklinkDto,
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentContentDto,
  DocumentDetailDto,
  DocumentLinkDto,
  DocumentPropertyDto,
  DocumentPropertyValueDto,
  DocumentStateDto,
  DocumentSummaryDto,
  UpdateDocumentContentRequestDto,
  UpdateDocumentRequestDto,
} from "@rme/contracts";

import type {
  DocumentConnections,
  DocumentProductRepository,
} from "@/modules/documents/ports/document-product-repository.js";
import {
  findLocalCurrentMarkdownProjection,
  isLocalReviewDocumentId,
  saveLocalCurrentMarkdownProjection,
} from "@/modules/documents/adapters/local-current-markdown-projection.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

type FolderRecord = Readonly<{
  id: string;
  parentFolderId: string | null;
  deletedAt: Date | null;
}>;

type DocumentPropertyRecord = Readonly<{
  documentId: string;
  key: string;
  type: string;
  value: JsonValue;
}>;

type DocumentRecord = Readonly<{
  id: string;
  folderId: string;
  title: string;
  state: string;
  markdownBody: string;
  latestRevisionId: string | null;
  publishedRevisionId: string | null;
  markdownBodyUpdatedAt: Date;
  archivedAt?: Date | null;
  properties?: readonly DocumentPropertyRecord[];
}>;

type DocumentSummaryRecord = Pick<
  DocumentRecord,
  "id" | "folderId" | "title" | "state" | "latestRevisionId" | "publishedRevisionId"
>;

type LinkEdgeRecord = Readonly<{
  sourceDocumentId: string;
  targetDocumentId: string;
  markdownHref: string;
  preview: string;
  sourceDocument?: { title: string };
  targetDocument?: { title: string };
}>;

type DocumentSelect = Readonly<{
  id: true;
  folderId: true;
  title: true;
  state: true;
  markdownBody: true;
  latestRevisionId: true;
  publishedRevisionId: true;
  markdownBodyUpdatedAt: true;
  archivedAt: true;
}>;

export type PrismaDocumentProductPersistenceClient = Readonly<{
  folder: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; parentFolderId: true; deletedAt: true };
    }): Promise<FolderRecord | null>;
  };
  document: {
    findMany(args: {
      where:
        | { folderId: string; archivedAt: null }
        | { archivedAt: { not: null }; folder: { workspaceId: string } };
      select:
        | Omit<DocumentSelect, "markdownBody" | "markdownBodyUpdatedAt" | "archivedAt">
        | Omit<DocumentSelect, "markdownBody" | "markdownBodyUpdatedAt">;
      orderBy: { title: "asc" } | { archivedAt: "desc" };
    }): Promise<DocumentRecord[]>;
    findUnique(args: {
      where: { id: string };
      select?: DocumentSelect;
      include?: { properties: { orderBy: { key: "asc" } } };
    }): Promise<DocumentRecord | null>;
    create(args: {
      data: {
        id: string;
        folderId: string;
        title: string;
        state: DocumentStateDto;
        markdownBodyRef: string;
        markdownBody: string;
        contentSource: "manualImport";
      };
      select: DocumentSelect;
    }): Promise<DocumentRecord>;
    update(args: {
      where: { id: string };
      data: {
        title?: string;
        state?: DocumentStateDto;
        folderId?: string;
        markdownBody?: string;
        contentSource?: "collaborationProjection" | "manualImport";
        archivedAt?: Date | null;
      };
      select: DocumentSelect;
    }): Promise<DocumentRecord>;
  };
  documentProperty: {
    deleteMany(args: { where: { documentId: string } }): Promise<unknown>;
    create(args: {
      data: {
        documentId: string;
        key: string;
        type: string;
        value: DocumentPropertyValueDto;
      };
    }): Promise<unknown>;
  };
  linkEdge: {
    findMany(
      args:
        | {
            where: { sourceDocumentId: string };
            include: { targetDocument: { select: { title: true } } };
            orderBy: { markdownHref: "asc" };
          }
        | {
            where: { targetDocumentId: string };
            include: { sourceDocument: { select: { title: true } } };
            orderBy: { markdownHref: "asc" };
          },
    ): Promise<LinkEdgeRecord[]>;
  };
  $transaction<T>(
    callback: (client: PrismaDocumentProductPersistenceClient) => Promise<T>,
  ): Promise<T>;
}>;

export class PrismaDocumentProductRepository implements DocumentProductRepository {
  constructor(private readonly client: PrismaDocumentProductPersistenceClient) {}

  async listByFolder(folderId: string): Promise<readonly DocumentSummaryDto[] | null> {
    if (!(await this.folderExists(folderId))) return null;
    const records = await this.client.document.findMany({
      where: { folderId, archivedAt: null },
      select: documentSummarySelect,
      orderBy: { title: "asc" },
    });
    return records.map(toDocumentSummaryDto);
  }

  async listArchivedByWorkspace(workspaceId: string): Promise<readonly ArchivedDocumentDto[]> {
    const records = await this.client.document.findMany({
      where: { archivedAt: { not: null }, folder: { workspaceId } },
      select: documentArchivedSummarySelect,
      orderBy: { archivedAt: "desc" },
    });
    return records.map(toArchivedDocumentDto);
  }

  async createInFolder(
    folderId: string,
    input: CreateDocumentRequestDto,
  ): Promise<DocumentDetailDto | null> {
    if (!(await this.folderExists(folderId))) return null;
    return this.client.$transaction(async (transaction) => {
      const document = await transaction.document.create({
        data: {
          id: newId("document"),
          folderId,
          title: input.title,
          state: input.state ?? "draft",
          markdownBodyRef: `documents/${randomUUID()}/current.md`,
          markdownBody: input.initialMarkdownBody ?? "",
          contentSource: "manualImport",
        },
        select: documentSelect,
      });
      await replaceDocumentProperties(transaction, document.id, input.properties ?? []);
      return required(await findDocumentDetail(transaction, document.id));
    });
  }

  async findDetail(documentId: string): Promise<DocumentDetailDto | null> {
    return findDocumentDetail(this.client, documentId);
  }

  async updateDocument(
    documentId: string,
    input: UpdateDocumentRequestDto,
  ): Promise<DocumentDetailDto | null> {
    const current = await this.findDetail(documentId);
    if (!current) return null;
    await this.client.document.update({
      where: { id: documentId },
      data: {
        ...(input.title === undefined ? {} : { title: input.title }),
        ...(input.state === undefined ? {} : { state: input.state }),
      },
      select: documentSelect,
    });
    return this.findDetail(documentId);
  }

  async moveDocument(
    documentId: string,
    targetFolderId: string,
  ): Promise<DocumentDetailDto | null> {
    if (!(await this.findDetail(documentId)) || !(await this.folderExists(targetFolderId))) {
      return null;
    }
    await this.client.document.update({
      where: { id: documentId },
      data: { folderId: targetFolderId },
      select: documentSelect,
    });
    return this.findDetail(documentId);
  }

  async deleteDocument(documentId: string): Promise<DeletedResourceResponseDto | null> {
    if (!(await this.findDetail(documentId))) return null;
    const deletedAt = new Date();
    await this.client.document.update({
      where: { id: documentId },
      data: { archivedAt: deletedAt },
      select: documentSelect,
    });
    return { id: documentId, deletedAt: deletedAt.toISOString() };
  }

  async restoreDocument(documentId: string): Promise<DocumentDetailDto | null> {
    const record = await this.client.document.findUnique({
      where: { id: documentId },
      select: documentSelect,
    });
    if (!record?.archivedAt || !(await this.folderExists(record.folderId))) return null;

    await this.client.document.update({
      where: { id: documentId },
      data: { archivedAt: null },
      select: documentSelect,
    });
    return this.findDetail(documentId);
  }

  async findContent(documentId: string): Promise<DocumentContentDto | null> {
    if (isLocalReviewDocumentId(documentId)) {
      const projection = findLocalCurrentMarkdownProjection(documentId);
      if (!projection) return null;
      return {
        documentId: projection.documentId,
        markdownBody: projection.markdownBody,
        latestRevisionId: projection.latestRevisionId,
        updatedAt: projection.updatedAt.toISOString(),
      };
    }

    const record = await this.client.document.findUnique({
      where: { id: documentId },
      select: documentSelect,
    });
    if (!record || record.archivedAt) return null;
    return toDocumentContentDto(record);
  }

  async updateContent(
    documentId: string,
    input: UpdateDocumentContentRequestDto,
  ): Promise<DocumentContentDto | null> {
    if (isLocalReviewDocumentId(documentId)) {
      const projection = saveLocalCurrentMarkdownProjection({
        documentId,
        markdownBody: input.markdownBody,
      });
      return {
        documentId: projection.documentId,
        markdownBody: projection.markdownBody,
        latestRevisionId: projection.latestRevisionId,
        updatedAt: projection.updatedAt.toISOString(),
      };
    }

    if (!(await this.findDetail(documentId))) return null;
    const record = await this.client.document.update({
      where: { id: documentId },
      data: {
        markdownBody: input.markdownBody,
        contentSource:
          input.source === "collaboration-projection" ? "collaborationProjection" : "manualImport",
      },
      select: documentSelect,
    });
    return toDocumentContentDto(record);
  }

  async replaceProperties(
    documentId: string,
    properties: readonly DocumentPropertyDto[],
  ): Promise<DocumentDetailDto | null> {
    if (!(await this.findDetail(documentId))) return null;
    return this.client.$transaction(async (transaction) => {
      await replaceDocumentProperties(transaction, documentId, properties);
      return required(await findDocumentDetail(transaction, documentId));
    });
  }

  async getConnections(documentId: string): Promise<DocumentConnections | null> {
    if (!(await this.findDetail(documentId))) return null;
    const [links, backlinks] = await Promise.all([
      this.client.linkEdge.findMany({
        where: { sourceDocumentId: documentId },
        include: { targetDocument: { select: { title: true } } },
        orderBy: { markdownHref: "asc" },
      }),
      this.client.linkEdge.findMany({
        where: { targetDocumentId: documentId },
        include: { sourceDocument: { select: { title: true } } },
        orderBy: { markdownHref: "asc" },
      }),
    ]);

    return {
      documentId,
      links: links.map(toDocumentLinkDto),
      backlinks: backlinks.map(toBacklinkDto),
    };
  }

  private async folderExists(folderId: string): Promise<boolean> {
    const folder = await this.client.folder.findUnique({
      where: { id: folderId },
      select: { id: true, parentFolderId: true, deletedAt: true },
    });
    if (!folder || folder.deletedAt) return false;
    let parentId = folder.parentFolderId;
    while (parentId) {
      const parent = await this.client.folder.findUnique({
        where: { id: parentId },
        select: { id: true, parentFolderId: true, deletedAt: true },
      });
      if (!parent || parent.deletedAt) return false;
      parentId = parent.parentFolderId;
    }
    return true;
  }
}

const documentSummarySelect = {
  id: true,
  folderId: true,
  title: true,
  state: true,
  latestRevisionId: true,
  publishedRevisionId: true,
} as const;
const documentSelect = {
  ...documentSummarySelect,
  markdownBody: true,
  markdownBodyUpdatedAt: true,
  archivedAt: true,
} as const;
const documentArchivedSummarySelect = {
  ...documentSummarySelect,
  archivedAt: true,
} as const;

async function findDocumentDetail(
  client: PrismaDocumentProductPersistenceClient,
  documentId: string,
): Promise<DocumentDetailDto | null> {
  const record = await client.document.findUnique({
    where: { id: documentId },
    include: { properties: { orderBy: { key: "asc" } } },
  });
  if (!record || record.archivedAt) return null;
  return toDocumentDetailDto(record);
}

async function replaceDocumentProperties(
  client: PrismaDocumentProductPersistenceClient,
  documentId: string,
  properties: readonly DocumentPropertyDto[],
): Promise<void> {
  await client.documentProperty.deleteMany({ where: { documentId } });
  for (const property of properties) {
    await client.documentProperty.create({
      data: {
        documentId,
        key: property.key,
        type: property.value.type,
        value: property.value,
      },
    });
  }
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function required<T>(value: T | null): T {
  if (value === null) throw new Error("Expected document record to exist in transaction.");
  return value;
}

function toDocumentSummaryDto(record: DocumentSummaryRecord): DocumentSummaryDto {
  return {
    id: record.id as DocumentSummaryDto["id"],
    folderId: record.folderId as DocumentSummaryDto["folderId"],
    title: record.title,
    state: toDocumentState(record.state),
    latestRevisionId: record.latestRevisionId as DocumentSummaryDto["latestRevisionId"],
    publishedRevisionId: record.publishedRevisionId as DocumentSummaryDto["publishedRevisionId"],
  };
}

function toArchivedDocumentDto(record: DocumentSummaryRecord & { archivedAt?: Date | null }) {
  return {
    ...toDocumentSummaryDto(record),
    archivedAt: (record.archivedAt ?? new Date(0)).toISOString(),
  } satisfies ArchivedDocumentDto;
}

function toDocumentDetailDto(record: DocumentRecord): DocumentDetailDto {
  return {
    ...toDocumentSummaryDto(record),
    markdownBody: record.markdownBody,
    properties: (record.properties ?? []).map(toDocumentPropertyDto),
  };
}

function toDocumentContentDto(record: DocumentRecord): DocumentContentDto {
  return {
    documentId: record.id as DocumentContentDto["documentId"],
    markdownBody: record.markdownBody,
    latestRevisionId: record.latestRevisionId as DocumentContentDto["latestRevisionId"],
    updatedAt: record.markdownBodyUpdatedAt.toISOString(),
  };
}

function toDocumentPropertyDto(record: DocumentPropertyRecord): DocumentPropertyDto {
  return {
    key: record.key,
    value: toDocumentPropertyValue(record),
  };
}

function toDocumentLinkDto(record: LinkEdgeRecord): DocumentLinkDto {
  return {
    sourceDocumentId: record.sourceDocumentId as DocumentLinkDto["sourceDocumentId"],
    targetDocumentId: record.targetDocumentId as DocumentLinkDto["targetDocumentId"],
    markdownHref: record.markdownHref,
    targetTitle: record.targetDocument?.title ?? "",
    preview: record.preview,
  };
}

function toBacklinkDto(record: LinkEdgeRecord): BacklinkDto {
  return {
    sourceDocumentId: record.sourceDocumentId as BacklinkDto["sourceDocumentId"],
    targetDocumentId: record.targetDocumentId as BacklinkDto["targetDocumentId"],
    markdownHref: record.markdownHref,
    sourceTitle: record.sourceDocument?.title ?? "",
    preview: record.preview,
  };
}

function toDocumentState(value: string): DocumentStateDto {
  if (value === "review" || value === "saved") return value;
  return "draft";
}

function toDocumentPropertyValue(record: DocumentPropertyRecord): DocumentPropertyValueDto {
  const value = record.value;
  if (isDocumentPropertyValue(value)) return value;

  return { type: "text", value: String(value ?? "") };
}

function isDocumentPropertyValue(value: JsonValue): value is DocumentPropertyValueDto {
  if (!isObject(value) || typeof value.type !== "string") return false;
  if (value.type === "checkbox") return typeof value.value === "boolean";
  if (value.type === "member") return typeof value.value === "string";
  if (value.type === "text" || value.type === "status" || value.type === "date") {
    return typeof value.value === "string";
  }
  return false;
}

function isObject(value: JsonValue): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
