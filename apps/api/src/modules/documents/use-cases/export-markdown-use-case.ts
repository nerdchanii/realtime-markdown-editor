import type {
  DocumentPropertyDto,
  MarkdownExportDto,
  MarkdownExportFrontmatterDto,
  MarkdownExportFrontmatterValueDto,
} from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { DocumentContentRepository } from "@/modules/documents/ports/document-content-repository.js";
import type { DocumentRepository } from "@/modules/documents/ports/document-repository.js";

export type ExportMarkdownInput = Readonly<{
  documentId: DocumentId;
  filename?: string;
}>;

export class MarkdownExportSourceNotFoundError extends Error {
  constructor(documentId: DocumentId) {
    super(`Markdown export source not found for document ${documentId}.`);
    this.name = "MarkdownExportSourceNotFoundError";
  }
}

export class ExportMarkdownUseCase {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly content: DocumentContentRepository,
  ) {}

  async execute(input: ExportMarkdownInput): Promise<MarkdownExportDto> {
    const [document, content] = await Promise.all([
      this.documents.findById(input.documentId),
      this.content.findCurrentContent(input.documentId),
    ]);
    if (!content) throw new MarkdownExportSourceNotFoundError(input.documentId);

    const frontmatter = createFrontmatter(document?.properties ?? []);

    return {
      documentId: input.documentId,
      filename: normalizeFilename(input.filename),
      contentType: "text/markdown; charset=utf-8",
      frontmatter,
      markdownBody: content.markdownBody,
      fileContents: createFileContents(frontmatter, content.markdownBody),
    };
  }
}

function createFrontmatter(
  properties: readonly Pick<DocumentPropertyDto, "key" | "value">[],
): MarkdownExportFrontmatterDto {
  return Object.fromEntries(
    properties.map((property) => [property.key, propertyValueToFrontmatter(property)]),
  );
}

function propertyValueToFrontmatter(
  property: Pick<DocumentPropertyDto, "value">,
): MarkdownExportFrontmatterValueDto {
  const { value } = property;
  if (value.type === "checkbox") return value.value;
  return value.value;
}

function createFileContents(frontmatter: MarkdownExportFrontmatterDto, markdownBody: string) {
  const frontmatterLines = Object.entries(frontmatter).map(
    ([key, value]) => `${key}: ${formatYamlScalar(value)}`,
  );

  return `---\n${frontmatterLines.join("\n")}\n---\n\n${markdownBody}`;
}

function formatYamlScalar(value: MarkdownExportFrontmatterValueDto) {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function normalizeFilename(filename: string | undefined) {
  if (filename === undefined) return "document.md";
  const trimmed = filename.trim();
  if (!trimmed) return "document.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
}
