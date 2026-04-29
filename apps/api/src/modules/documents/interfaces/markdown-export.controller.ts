import { Body, Controller, Header, Param, Post } from "@nestjs/common";
import type { CreateMarkdownExportRequestDto, MarkdownExportResponseDto } from "@rme/contracts";

import { ExportMarkdownUseCase } from "@/modules/documents/use-cases/export-markdown-use-case.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";

type MarkdownExportRequestBody = Omit<CreateMarkdownExportRequestDto, "properties"> &
  Readonly<{
    properties: CreateMarkdownExportRequestDto["properties"] | string;
  }>;

@Controller("documents")
export class MarkdownExportController {
  constructor(private readonly exportMarkdown: ExportMarkdownUseCase) {}

  @Post(":documentId/export")
  @Header("Access-Control-Allow-Origin", "*")
  createMarkdownExport(
    @Param("documentId") documentId: string,
    @Body() body: MarkdownExportRequestBody,
  ): MarkdownExportResponseDto {
    return this.exportMarkdown.execute({
      documentId: documentId as DocumentId,
      filename: body.filename,
      properties: parseProperties(body.properties),
      markdownBody: body.markdownBody,
    });
  }
}

function parseProperties(properties: MarkdownExportRequestBody["properties"]) {
  if (typeof properties !== "string") return properties;
  return JSON.parse(properties) as CreateMarkdownExportRequestDto["properties"];
}
