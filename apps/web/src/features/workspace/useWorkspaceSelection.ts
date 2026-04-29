import { useMemo, useState } from "react";

import { workspaceDocumentSelectedEventName } from "./events";
import { findDocumentSelection, normalizeViewModel } from "./tree-utils";
import type { WorkspaceNavigationSelection, WorkspaceNavigationViewModel } from "./types";

export function useWorkspaceSelection(viewModel: WorkspaceNavigationViewModel) {
  const model = useMemo(() => normalizeViewModel(viewModel), [viewModel]);
  const [localSelectedDocumentId, setLocalSelectedDocumentId] = useState(model.selectedDocumentId);
  const isSelectionControlled = viewModel.selectedDocumentId !== undefined;
  const selectedDocumentId = isSelectionControlled
    ? viewModel.selectedDocumentId
    : localSelectedDocumentId;
  const selectedDocument = findDocumentSelection(model, selectedDocumentId);

  const selectDocument = (selection: WorkspaceNavigationSelection) => {
    setLocalSelectedDocumentId(selection.documentId);
    viewModel.onSelectDocument?.(selection);
    dispatchDocumentSelection(selection);
  };

  return { model, selectedDocument, selectedDocumentId, selectDocument };
}

function dispatchDocumentSelection(selection: WorkspaceNavigationSelection) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<WorkspaceNavigationSelection>(workspaceDocumentSelectedEventName, {
      detail: selection,
    }),
  );
}
