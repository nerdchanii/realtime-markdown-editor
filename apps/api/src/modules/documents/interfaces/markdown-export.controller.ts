import { Body, Controller, Headers, Inject, NotFoundException, Param, Post } from "@nestjs/common";
import type { CreateMarkdownExportRequestDto, MarkdownExportResponseDto } from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import {
  ExportMarkdownUseCase,
  MarkdownExportSourceNotFoundError,
} from "@/modules/documents/use-cases/export-markdown-use-case.js";

@Controller("documents")
export class MarkdownExportController {
  constructor(
    @Inject(ExportMarkdownUseCase)
    private readonly exportMarkdown: ExportMarkdownUseCase,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Post(":documentId/export")
  async createMarkdownExport(
    @Param("documentId") documentId: string,
    @Body() body: CreateMarkdownExportRequestDto | undefined,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<MarkdownExportResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    const input =
      body?.filename === undefined
        ? { documentId: documentId as DocumentId }
        : { documentId: documentId as DocumentId, filename: body.filename };

    return this.exportMarkdown.execute(input).catch((error: unknown) => {
      if (error instanceof MarkdownExportSourceNotFoundError) {
        throw new NotFoundException("Markdown export source not found.");
      }
      throw error;
    });
  }
}
