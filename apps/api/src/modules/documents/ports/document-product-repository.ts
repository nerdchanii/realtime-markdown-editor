import type {
  ArchivedDocumentDto,
  BacklinkDto,
  CreateDocumentRequestDto,
  DeletedResourceResponseDto,
  DocumentDetailDto,
  DocumentLinkDto,
  DocumentPropertyDto,
  DocumentStateDto,
  DocumentSummaryDto,
  MoveDocumentRequestDto,
  ReplaceDocumentPropertiesRequestDto,
  UpdateDocumentRequestDto,
} from "@rme/contracts";

export const DOCUMENT_PRODUCT_REPOSITORY = Symbol("DOCUMENT_PRODUCT_REPOSITORY");

export type DocumentConnections = Readonly<{
  documentId: string;
  links: readonly DocumentLinkDto[];
  backlinks: readonly BacklinkDto[];
}>;

export interface DocumentProductRepository {
  listByFolder(folderId: string): Promise<readonly DocumentSummaryDto[] | null>;
  listArchivedByWorkspace(workspaceId: string): Promise<readonly ArchivedDocumentDto[] | null>;
  createInFolder(
    folderId: string,
    input: CreateDocumentRequestDto,
  ): Promise<DocumentDetailDto | null>;
  findDetail(documentId: string): Promise<DocumentDetailDto | null>;
  updateDocument(
    documentId: string,
    input: UpdateDocumentRequestDto & { state?: DocumentStateDto },
  ): Promise<DocumentDetailDto | null>;
  moveDocument(
    documentId: string,
    targetFolderId: MoveDocumentRequestDto["targetFolderId"],
  ): Promise<DocumentDetailDto | null>;
  deleteDocument(documentId: string): Promise<DeletedResourceResponseDto | null>;
  restoreDocument(documentId: string): Promise<DocumentDetailDto | null>;
  replaceProperties(
    documentId: string,
    properties: ReplaceDocumentPropertiesRequestDto["properties"] | readonly DocumentPropertyDto[],
  ): Promise<DocumentDetailDto | null>;
  getConnections(documentId: string): Promise<DocumentConnections | null>;
}
