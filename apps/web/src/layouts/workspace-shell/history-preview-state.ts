import { useState } from "react";

import type { EditorHistoryPreview } from "@/features/editor";
import type { HistoryCheckpoint } from "@/features/history";

export function useHistoryPreviewState(activeDocumentId: string | undefined) {
  const [historyPreview, setHistoryPreview] = useState<Readonly<{
    documentId: string;
    preview: EditorHistoryPreview;
  }> | null>(null);
  const visibleHistoryPreview =
    historyPreview && historyPreview.documentId === activeDocumentId
      ? historyPreview.preview
      : null;

  return {
    closeHistoryPreview: () => setHistoryPreview(null),
    previewCheckpoint: (checkpoint: HistoryCheckpoint) => {
      if (!activeDocumentId) return;
      setHistoryPreview({
        documentId: activeDocumentId,
        preview: createEditorHistoryPreview(checkpoint),
      });
    },
    visibleHistoryPreview,
  };
}

function createEditorHistoryPreview(checkpoint: HistoryCheckpoint): EditorHistoryPreview {
  return {
    checkpointId: checkpoint.id,
    label: checkpoint.message.trim() || "Saved revision",
    markdown: checkpoint.snapshot,
  };
}
