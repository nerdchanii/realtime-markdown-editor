import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentResponseDto,
  ListArchivedDocumentsResponseDto,
  ListDocumentsResponseDto,
  MoveDocumentRequestDto,
  ReplaceDocumentPropertiesRequestDto,
  UpdateDocumentContentRequestDto,
  UpdateDocumentRequestDto,
} from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import {
  DOCUMENT_CONTENT_REPOSITORY,
  type DocumentContentProjection,
  type DocumentContentRepository,
} from "@/modules/documents/ports/document-content-repository.js";
import {
  DOCUMENT_PRODUCT_REPOSITORY,
  type DocumentProductRepository,
} from "@/modules/documents/ports/document-product-repository.js";

@Injectable()
export class DocumentProductService {
  constructor(
    @Inject(DOCUMENT_PRODUCT_REPOSITORY)
    private readonly repository: DocumentProductRepository,
    @Inject(DOCUMENT_CONTENT_REPOSITORY)
    private readonly content: DocumentContentRepository,
  ) {}

  async listByFolder(folderId: string): Promise<ListDocumentsResponseDto> {
    return {
      documents: required(await this.repository.listByFolder(folderId), "Folder not found."),
    };
  }

  async listArchivedByWorkspace(workspaceId: string): Promise<ListArchivedDocumentsResponseDto> {
    return {
      documents: required(
        await this.repository.listArchivedByWorkspace(workspaceId),
        "Workspace not found.",
      ),
    };
  }

  async createInFolder(
    folderId: string,
    input: CreateDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    const title = normalizeTitle(input.title);
    await this.assertUniqueTitle(folderId, title);
    return {
      document: required(
        await this.repository.createInFolder(folderId, { ...input, title }),
        "Folder not found.",
      ),
    };
  }

  async getDocument(documentId: string): Promise<DocumentResponseDto> {
    return {
      document: required(await this.repository.findDetail(documentId), "Document not found."),
    };
  }

  async updateDocument(
    documentId: string,
    input: UpdateDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    const current = required(await this.repository.findDetail(documentId), "Document not found.");
    const title = input.title === undefined ? undefined : normalizeTitle(input.title);
    if (title !== undefined) {
      await this.assertUniqueTitle(current.folderId, title, documentId);
    }
    const updateInput =
      title === undefined
        ? input
        : {
            ...input,
            title,
          };

    return {
      document: required(
        await this.repository.updateDocument(documentId, updateInput),
        "Document not found.",
      ),
    };
  }

  async moveDocument(
    documentId: string,
    input: MoveDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    return {
      document: required(
        await this.repository.moveDocument(documentId, input.targetFolderId),
        "Document or target folder not found.",
      ),
    };
  }

  async deleteDocument(documentId: string): Promise<DeletedResourceResponseDto> {
    return required(await this.repository.deleteDocument(documentId), "Document not found.");
  }

  async restoreDocument(documentId: string): Promise<DocumentResponseDto> {
    return {
      document: required(
        await this.repository.restoreDocument(documentId),
        "Archived document or restore target not found.",
      ),
    };
  }

  async getContent(documentId: string): Promise<DocumentContentResponseDto> {
    await this.getExistingDocument(documentId);
    return {
      content: toDocumentContentDto(
        required(
          await this.content.findCurrentContent(documentId as DocumentId),
          "Document not found.",
        ),
      ),
    };
  }

  async updateContent(
    documentId: string,
    input: UpdateDocumentContentRequestDto,
  ): Promise<DocumentContentResponseDto> {
    const current = await this.getExistingDocument(documentId);
    return {
      content: toDocumentContentDto(
        await this.content.saveCurrentContent({
          documentId: documentId as DocumentId,
          markdownBody: input.markdownBody,
          latestRevisionId: input.baseRevisionId ?? current.latestRevisionId,
          source: input.source,
        }),
      ),
    };
  }

  async replaceProperties(
    documentId: string,
    input: ReplaceDocumentPropertiesRequestDto,
  ): Promise<DocumentResponseDto> {
    return {
      document: required(
        await this.repository.replaceProperties(documentId, input.properties),
        "Document not found.",
      ),
    };
  }

  async getConnections(documentId: string): Promise<DocumentConnectionsResponseDto> {
    const connections = required(
      await this.repository.getConnections(documentId),
      "Document not found.",
    );
    return {
      ...connections,
      documentId: connections.documentId as DocumentConnectionsResponseDto["documentId"],
    };
  }

  private async assertUniqueTitle(
    folderId: string,
    title: string,
    currentDocumentId?: string,
  ): Promise<void> {
    const documents = required(await this.repository.listByFolder(folderId), "Folder not found.");
    const normalizedTitle = title.toLowerCase();
    const duplicate = documents.some(
      (document) =>
        document.id !== currentDocumentId &&
        document.title.trim().toLowerCase() === normalizedTitle,
    );
    if (duplicate) throw new BadRequestException("Document title must be unique in the folder.");
  }

  private async getExistingDocument(documentId: string) {
    return required(await this.repository.findDetail(documentId), "Document not found.");
  }
}

function required<T>(value: T | null, message: string): T {
  if (value === null) throw new NotFoundException(message);
  return value;
}

function normalizeTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) throw new BadRequestException("Document title is required.");
  return trimmed;
}

function toDocumentContentDto(projection: DocumentContentProjection) {
  return {
    documentId: projection.documentId,
    markdownBody: projection.markdownBody,
    latestRevisionId: projection.latestRevisionId,
    updatedAt: projection.updatedAt.toISOString(),
  };
}
