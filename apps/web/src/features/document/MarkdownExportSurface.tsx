import { useState } from "react";

import type { DocumentId, MarkdownExportResponseDto } from "@rme/contracts";

import { createMarkdownExport, createMockApiClient } from "@/lib/api-client";

import type { DocumentProperty } from "./types";

export function MarkdownExportSurface({
  documentId,
  title,
}: {
  documentId: string | undefined;
  title: string;
  properties: readonly DocumentProperty[];
}) {
  const { exportResult, exportError, createExport } = useMarkdownExport({
    documentId,
    title,
  });

  return (
    <section aria-label="Markdown export" data-testid="markdown-export">
      <ExportButton onExport={createExport} />
      {exportResult ? <ExportResult result={exportResult} /> : null}
      {exportError ? (
        <div role="alert" data-testid="markdown-export-error">
          {exportError}
        </div>
      ) : null}
    </section>
  );
}

function ExportButton({ onExport }: { onExport: () => Promise<void> }) {
  return (
    <button type="button" data-testid="markdown-export-button" onClick={() => void onExport()}>
      Export Markdown
    </button>
  );
}

function useMarkdownExport({
  documentId,
  title,
}: Readonly<{
  documentId: string | undefined;
  title: string;
}>) {
  const [exportResult, setExportResult] = useState<MarkdownExportResponseDto | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const createExport = async () => {
    try {
      const result = await requestMarkdownExport(documentId, title);
      setExportError(null);
      setExportResult(result);
    } catch (error) {
      setExportError(toErrorMessage(error));
    }
  };

  return { exportResult, exportError, createExport };
}

function requestMarkdownExport(documentId: string | undefined, title: string) {
  const exportDocumentId = (documentId ?? readDocumentId()) as DocumentId;

  return createMarkdownExport(createMockApiClient(), exportDocumentId, {
    filename: `${slugify(title)}.md`,
  });
}

function ExportResult({ result }: { result: MarkdownExportResponseDto }) {
  return (
    <div data-testid="markdown-export-result" style={exportResultStyle}>
      <div data-testid="markdown-export-filename">{result.filename}</div>
      <pre data-testid="markdown-export-output" style={exportOutputStyle}>
        {result.fileContents}
      </pre>
    </div>
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

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Markdown export failed";
}

const exportResultStyle = {
  display: "grid",
  gap: "6px",
  marginTop: "8px",
};

const exportOutputStyle = {
  maxHeight: "160px",
  overflow: "auto",
  margin: 0,
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "8px",
  whiteSpace: "pre-wrap" as const,
  color: "var(--color-text-primary)",
  fontSize: "12px",
};
