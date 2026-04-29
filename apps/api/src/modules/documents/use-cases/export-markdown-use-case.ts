import type {
  CreateMarkdownExportRequestDto,
  DocumentPropertyDto,
  MarkdownExportDto,
  MarkdownExportFrontmatterDto,
  MarkdownExportFrontmatterValueDto,
} from "@rme/contracts";

export class ExportMarkdownUseCase {
  execute(input: CreateMarkdownExportRequestDto): MarkdownExportDto {
    const frontmatter = createFrontmatter(input.properties);

    return {
      documentId: input.documentId,
      filename: normalizeFilename(input.filename),
      contentType: "text/markdown; charset=utf-8",
      frontmatter,
      markdownBody: input.markdownBody,
      fileContents: createFileContents(frontmatter, input.markdownBody),
    };
  }
}

function createFrontmatter(
  properties: readonly DocumentPropertyDto[],
): MarkdownExportFrontmatterDto {
  return Object.fromEntries(
    properties.map((property) => [property.key, propertyValueToFrontmatter(property)]),
  );
}

function propertyValueToFrontmatter(
  property: DocumentPropertyDto,
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

function normalizeFilename(filename: string) {
  const trimmed = filename.trim();
  if (!trimmed) return "document.md";
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
}
