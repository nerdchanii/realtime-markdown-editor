import type { DocumentId } from "@rme/contracts";

import {
  createCollaborationCheckpoint,
  createMarkdownExport,
  updateDocumentContent,
  type ApiClient,
} from "@/lib/api-client";

export type CheckpointSaveStatus = "idle" | "saving" | "saved" | "failed";
export type MarkdownExportStatus = "idle" | "exporting" | "failed";

export async function saveEditorCheckpoint(
  input: Readonly<{
    apiClient: ApiClient;
    documentId: string;
    markdown: string;
  }>,
) {
  await updateDocumentContent(input.apiClient, input.documentId as DocumentId, {
    markdownBody: input.markdown,
    source: "collaboration-projection",
  });
  await createCollaborationCheckpoint(input.apiClient, input.documentId, {
    message: "Manual checkpoint",
  });
}

export async function exportEditorMarkdown(
  input: Readonly<{
    apiClient: ApiClient;
    documentId: string;
    markdown: string;
    title: string;
  }>,
) {
  await updateDocumentContent(input.apiClient, input.documentId as DocumentId, {
    markdownBody: input.markdown,
    source: "collaboration-projection",
  });
  const result = await createMarkdownExport(input.apiClient, input.documentId, {
    filename: `${slugify(input.title)}.md`,
  });
  downloadMarkdownFile(result.filename, result.fileContents);
}

function downloadMarkdownFile(filename: string, fileContents: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([fileContents], { type: "text/markdown;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  window.document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, "-") || "document";
}
