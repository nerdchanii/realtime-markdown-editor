import { Body, Controller, Inject, NotFoundException, Param, Post } from "@nestjs/common";
import type { CreateMarkdownExportRequestDto, MarkdownExportResponseDto } from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import {
  ExportMarkdownUseCase,
  MarkdownExportSourceNotFoundError,
} from "@/modules/documents/use-cases/export-markdown-use-case.js";

@Controller("documents")
export class MarkdownExportController {
  constructor(
    @Inject(ExportMarkdownUseCase)
    private readonly exportMarkdown: ExportMarkdownUseCase,
  ) {}

  @Post(":documentId/export")
  createMarkdownExport(
    @Param("documentId") documentId: string,
    @Body() body: CreateMarkdownExportRequestDto,
  ): Promise<MarkdownExportResponseDto> {
    const input =
      body.filename === undefined
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
