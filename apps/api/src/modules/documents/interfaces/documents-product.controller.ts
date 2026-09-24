import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import type {
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentId,
  DocumentResponseDto,
  FolderId,
  ListArchivedDocumentsResponseDto,
  ListDocumentsResponseDto,
  MoveDocumentRequestDto,
  ReplaceDocumentPropertiesRequestDto,
  UpdateDocumentContentRequestDto,
  UpdateDocumentRequestDto,
  WorkspaceId,
} from "@rme/contracts";

import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import { DocumentProductService } from "@/modules/documents/use-cases/document-product-service.js";

@Controller()
export class DocumentsProductController {
  constructor(
    @Inject(DocumentProductService)
    private readonly documents: DocumentProductService,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Get("folders/:folderId/documents")
  async listByFolder(
    @Param("folderId") folderId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ListDocumentsResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    return this.documents.listByFolder(folderId);
  }

  @Get("workspaces/:workspaceId/trash/documents")
  async listArchivedByWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ListArchivedDocumentsResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return this.documents.listArchivedByWorkspace(workspaceId);
  }

  @Post("folders/:folderId/documents")
  async createInFolder(
    @Param("folderId") folderId: string,
    @Body() body: CreateDocumentRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    return this.documents.createInFolder(folderId, body);
  }

  @Get("documents/:documentId")
  async getDocument(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.getDocument(documentId);
  }

  @Patch("documents/:documentId")
  async updateDocument(
    @Param("documentId") documentId: string,
    @Body() body: UpdateDocumentRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.updateDocument(documentId, body);
  }

  @Post("documents/:documentId/move")
  async moveDocument(
    @Param("documentId") documentId: string,
    @Body() body: MoveDocumentRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    await this.access.requireFolderAccess(cookieHeader, body.targetFolderId);
    return this.documents.moveDocument(documentId, body);
  }

  @Delete("documents/:documentId")
  async deleteDocument(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DeletedResourceResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.deleteDocument(documentId);
  }

  @Post("documents/:documentId/restore")
  async restoreDocument(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.restoreDocument(documentId);
  }

  @Get("documents/:documentId/content")
  async getContent(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentContentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.getContent(documentId);
  }

  @Put("documents/:documentId/content")
  async updateContent(
    @Param("documentId") documentId: string,
    @Body() body: UpdateDocumentContentRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentContentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.updateContent(documentId, body);
  }

  @Put("documents/:documentId/properties")
  async replaceProperties(
    @Param("documentId") documentId: string,
    @Body() body: ReplaceDocumentPropertiesRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.replaceProperties(documentId, body);
  }

  @Get("documents/:documentId/connections")
  async getConnections(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DocumentConnectionsResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.documents.getConnections(documentId);
  }
}
