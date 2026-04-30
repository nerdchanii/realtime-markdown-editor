import type { DocumentPropertyValue } from "@/modules/documents/domain/document-property.js";
import type { Document, DocumentId } from "@/modules/documents/domain/document.js";
import type { DocumentState } from "@/modules/documents/domain/document-state.js";
import type { FolderId } from "@/modules/documents/domain/references.js";
import type { DocumentRepository } from "@/modules/documents/ports/document-repository.js";
import { isLocalReviewDocumentId } from "@/modules/documents/adapters/local-current-markdown-projection.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

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
  markdownBodyRef: string;
  state: string;
  properties?: readonly DocumentPropertyRecord[];
}>;

type DocumentUpsertRecord = Readonly<{
  folderId: string;
  title: string;
  markdownBodyRef: string;
  state: DocumentState;
}>;

export type PrismaDocumentPersistenceClient = Readonly<{
  document: {
    findUnique(args: {
      where: { id: string };
      include: { properties: { orderBy: { key: "asc" } } };
    }): Promise<DocumentRecord | null>;
    upsert(args: {
      where: { id: string };
      create: DocumentUpsertRecord & { id: string };
      update: DocumentUpsertRecord;
    }): Promise<unknown>;
  };
  documentProperty: {
    deleteMany(args: { where: { documentId: string } }): Promise<unknown>;
    create(args: { data: DocumentPropertyRecord }): Promise<unknown>;
  };
  $transaction<T>(callback: (client: PrismaDocumentPersistenceClient) => Promise<T>): Promise<T>;
}>;

export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly client: PrismaDocumentPersistenceClient) {}

  async findById(id: DocumentId): Promise<Document | null> {
    if (isLocalReviewDocumentId(id)) return null;

    const record = await this.client.document.findUnique({
      where: { id },
      include: { properties: { orderBy: { key: "asc" } } },
    });
    if (!record) return null;

    return toDocument(record);
  }

  async save(document: Document): Promise<void> {
    await this.client.$transaction(async (transaction) => {
      const record = toDocumentUpsertRecord(document);
      await transaction.document.upsert({
        where: { id: document.id },
        create: { id: document.id, ...record },
        update: record,
      });
      await transaction.documentProperty.deleteMany({ where: { documentId: document.id } });

      for (const property of document.properties) {
        await transaction.documentProperty.create({
          data: {
            documentId: document.id,
            key: property.key,
            type: property.value.type,
            value: property.value,
          },
        });
      }
    });
  }
}

function toDocument(record: DocumentRecord): Document {
  return {
    id: record.id as DocumentId,
    folderId: record.folderId as FolderId,
    title: record.title,
    markdownBodyRef: record.markdownBodyRef,
    state: toDocumentState(record.state),
    properties: (record.properties ?? []).map((property) => ({
      key: property.key,
      value: toDocumentPropertyValue(property),
    })),
  };
}

function toDocumentUpsertRecord(document: Document): DocumentUpsertRecord {
  return {
    folderId: document.folderId,
    title: document.title,
    markdownBodyRef: document.markdownBodyRef,
    state: document.state,
  };
}

function toDocumentState(value: string): DocumentState {
  if (value === "review" || value === "saved") return value;
  return "draft";
}

function toDocumentPropertyValue(record: DocumentPropertyRecord): DocumentPropertyValue {
  const value = record.value;
  if (isDocumentPropertyValue(value)) return value;

  return {
    type: "text",
    value: String(value ?? ""),
  };
}

function isDocumentPropertyValue(value: JsonValue): value is DocumentPropertyValue {
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
