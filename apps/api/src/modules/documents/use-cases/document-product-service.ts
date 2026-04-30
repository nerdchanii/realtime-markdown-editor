import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentResponseDto,
  ListDocumentsResponseDto,
  MoveDocumentRequestDto,
  ReplaceDocumentPropertiesRequestDto,
  UpdateDocumentContentRequestDto,
  UpdateDocumentRequestDto,
} from "@rme/contracts";

import {
  DOCUMENT_PRODUCT_REPOSITORY,
  type DocumentProductRepository,
} from "@/modules/documents/ports/document-product-repository.js";

@Injectable()
export class DocumentProductService {
  constructor(
    @Inject(DOCUMENT_PRODUCT_REPOSITORY)
    private readonly repository: DocumentProductRepository,
  ) {}

  async listByFolder(folderId: string): Promise<ListDocumentsResponseDto> {
    return {
      documents: required(await this.repository.listByFolder(folderId), "Folder not found."),
    };
  }

  async createInFolder(
    folderId: string,
    input: CreateDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    return {
      document: required(
        await this.repository.createInFolder(folderId, input),
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
    return {
      document: required(
        await this.repository.updateDocument(documentId, input),
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

  async getContent(documentId: string): Promise<DocumentContentResponseDto> {
    return {
      content: required(await this.repository.findContent(documentId), "Document not found."),
    };
  }

  async updateContent(
    documentId: string,
    input: UpdateDocumentContentRequestDto,
  ): Promise<DocumentContentResponseDto> {
    return {
      content: required(
        await this.repository.updateContent(documentId, input),
        "Document not found.",
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
}

function required<T>(value: T | null, message: string): T {
  if (value === null) throw new NotFoundException(message);
  return value;
}
