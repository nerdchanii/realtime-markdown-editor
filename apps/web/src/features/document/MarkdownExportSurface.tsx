import type { DocumentId, DocumentPropertyDto, WorkspaceMembershipId } from "@rme/contracts";

import { createMarkdownExport, createMockApiClient } from "@/lib/api-client";

import type { DocumentProperty } from "./types";

export function MarkdownExportSurface({
  documentId,
  title,
  properties,
}: {
  documentId: string | undefined;
  title: string;
  properties: readonly DocumentProperty[];
}) {
  const createExport = async () => {
    const exportDocumentId = (documentId ?? readDocumentId()) as DocumentId;
    await createMarkdownExport(createMockApiClient(), exportDocumentId, {
      documentId: exportDocumentId,
      filename: `${slugify(title)}.md`,
      properties: properties.map(toPropertyDto),
      markdownBody: readCurrentMarkdown(),
    });
  };

  return (
    <section aria-label="Markdown export" data-testid="markdown-export">
      <button
        type="button"
        data-testid="markdown-export-button"
        onClick={() => void createExport()}
      >
        Export Markdown
      </button>
    </section>
  );
}

function toPropertyDto(property: DocumentProperty): DocumentPropertyDto {
  const key = property.key ?? property.label;
  const valueType = property.valueType ?? inferPropertyType(property);

  if (valueType === "checkbox") {
    return { key, value: { type: "checkbox", value: property.value === "true" } };
  }

  if (valueType === "member") {
    return { key, value: { type: "member", value: memberIdForProperty(property.value) } };
  }

  return { key, value: { type: valueType, value: property.value } };
}

function inferPropertyType(property: DocumentProperty) {
  const label = property.label.toLowerCase();
  if (label.includes("date")) return "date";
  if (label.includes("owner")) return "member";
  if (label.includes("evidence")) return "checkbox";
  if (property.tone === "warning") return "status";
  return "text";
}

function memberIdForProperty(value: string): WorkspaceMembershipId {
  if (value.startsWith("member_")) return value as WorkspaceMembershipId;
  return `member_${value.toLowerCase().replaceAll(" ", "_")}` as WorkspaceMembershipId;
}

function readCurrentMarkdown() {
  if (typeof document === "undefined") return "";

  return (
    document.querySelector<HTMLTextAreaElement>('[data-testid="collaborative-markdown-editor"]')
      ?.value ?? ""
  );
}

function readDocumentId() {
  if (typeof window === "undefined") return "document_review_plan";

  const routeDocument = new URLSearchParams(window.location.search).get("document");
  return routeDocument === "seed-review-plan" || !routeDocument
    ? "document_review_plan"
    : routeDocument;
}

function slugify(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, "-") || "document";
}
