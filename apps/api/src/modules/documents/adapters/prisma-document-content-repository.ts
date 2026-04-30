import type { RevisionId } from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import type {
  DocumentContentProjection,
  DocumentContentRepository,
  DocumentContentSource,
  SaveDocumentContentInput,
} from "@/modules/documents/ports/document-content-repository.js";

type DocumentContentRecord = Readonly<{
  id: string;
  markdownBody: string;
  latestRevisionId: string | null;
  markdownBodyUpdatedAt: Date;
}>;

export type PrismaDocumentContentPersistenceClient = Readonly<{
  document: {
    findUnique(args: {
      where: { id: string };
      select: {
        id: true;
        markdownBody: true;
        latestRevisionId: true;
        markdownBodyUpdatedAt: true;
      };
    }): Promise<DocumentContentRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        markdownBody: string;
        latestRevisionId: string | null;
        contentSource: "collaborationProjection" | "manualImport";
      };
      select: {
        id: true;
        markdownBody: true;
        latestRevisionId: true;
        markdownBodyUpdatedAt: true;
      };
    }): Promise<DocumentContentRecord>;
  };
}>;

export class PrismaDocumentContentRepository implements DocumentContentRepository {
  constructor(private readonly client: PrismaDocumentContentPersistenceClient) {}

  async findCurrentContent(documentId: DocumentId): Promise<DocumentContentProjection | null> {
    const record = await this.client.document.findUnique({
      where: { id: documentId },
      select: documentContentSelect,
    });
    if (!record) return null;

    return toDocumentContentProjection(record);
  }

  async saveCurrentContent(input: SaveDocumentContentInput): Promise<DocumentContentProjection> {
    const record = await this.client.document.update({
      where: { id: input.documentId },
      data: {
        markdownBody: input.markdownBody,
        latestRevisionId: input.latestRevisionId ?? null,
        contentSource: toPrismaContentSource(input.source),
      },
      select: documentContentSelect,
    });

    return toDocumentContentProjection(record);
  }
}

const documentContentSelect = {
  id: true,
  markdownBody: true,
  latestRevisionId: true,
  markdownBodyUpdatedAt: true,
} as const;

function toDocumentContentProjection(record: DocumentContentRecord): DocumentContentProjection {
  return {
    documentId: record.id as DocumentId,
    markdownBody: record.markdownBody,
    latestRevisionId: record.latestRevisionId as RevisionId | null,
    updatedAt: record.markdownBodyUpdatedAt,
  };
}

function toPrismaContentSource(
  source: DocumentContentSource,
): "collaborationProjection" | "manualImport" {
  return source === "collaboration-projection" ? "collaborationProjection" : "manualImport";
}
