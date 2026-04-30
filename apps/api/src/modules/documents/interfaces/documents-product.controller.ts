import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put } from "@nestjs/common";
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

import { DocumentProductService } from "@/modules/documents/use-cases/document-product-service.js";

@Controller()
export class DocumentsProductController {
  constructor(
    @Inject(DocumentProductService)
    private readonly documents: DocumentProductService,
  ) {}

  @Get("folders/:folderId/documents")
  listByFolder(@Param("folderId") folderId: string): Promise<ListDocumentsResponseDto> {
    return this.documents.listByFolder(folderId);
  }

  @Post("folders/:folderId/documents")
  createInFolder(
    @Param("folderId") folderId: string,
    @Body() body: CreateDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    return this.documents.createInFolder(folderId, body);
  }

  @Get("documents/:documentId")
  getDocument(@Param("documentId") documentId: string): Promise<DocumentResponseDto> {
    return this.documents.getDocument(documentId);
  }

  @Patch("documents/:documentId")
  updateDocument(
    @Param("documentId") documentId: string,
    @Body() body: UpdateDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    return this.documents.updateDocument(documentId, body);
  }

  @Post("documents/:documentId/move")
  moveDocument(
    @Param("documentId") documentId: string,
    @Body() body: MoveDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    return this.documents.moveDocument(documentId, body);
  }

  @Delete("documents/:documentId")
  deleteDocument(@Param("documentId") documentId: string): Promise<DeletedResourceResponseDto> {
    return this.documents.deleteDocument(documentId);
  }

  @Get("documents/:documentId/content")
  getContent(@Param("documentId") documentId: string): Promise<DocumentContentResponseDto> {
    return this.documents.getContent(documentId);
  }

  @Put("documents/:documentId/content")
  updateContent(
    @Param("documentId") documentId: string,
    @Body() body: UpdateDocumentContentRequestDto,
  ): Promise<DocumentContentResponseDto> {
    return this.documents.updateContent(documentId, body);
  }

  @Put("documents/:documentId/properties")
  replaceProperties(
    @Param("documentId") documentId: string,
    @Body() body: ReplaceDocumentPropertiesRequestDto,
  ): Promise<DocumentResponseDto> {
    return this.documents.replaceProperties(documentId, body);
  }

  @Get("documents/:documentId/connections")
  getConnections(@Param("documentId") documentId: string): Promise<DocumentConnectionsResponseDto> {
    return this.documents.getConnections(documentId);
  }
}
