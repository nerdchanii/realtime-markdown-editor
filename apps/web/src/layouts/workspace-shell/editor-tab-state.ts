import { useState } from "react";
import type { DocumentId } from "@rme/contracts";

import type { WorkspaceNavigationSelection } from "@/features/workspace";

import type { EditorTabViewModel } from "./EditorTabs";

export function useEditorTabState({
  activeDocumentId,
  displayedTitle,
  selectDocumentId,
}: Readonly<{
  activeDocumentId: string | undefined;
  displayedTitle: string;
  selectDocumentId: (documentId: DocumentId) => void;
}>) {
  const [openTabs, setOpenTabs] = useState<readonly EditorTabViewModel[]>([]);
  const displayedOpenTabs = activeDocumentId
    ? upsertOpenTab(openTabs, {
        documentId: activeDocumentId,
        title: displayedTitle,
      })
    : openTabs;

  return {
    closeTab: (documentId: string) => {
      const nextTabs = displayedOpenTabs.filter((tab) => tab.documentId !== documentId);
      setOpenTabs(nextTabs);
      if (documentId === activeDocumentId && nextTabs[0]) {
        selectDocumentId(nextTabs[0].documentId as DocumentId);
      }
    },
    fallbackTabs:
      displayedOpenTabs.length || !activeDocumentId
        ? displayedOpenTabs
        : [{ documentId: activeDocumentId, title: displayedTitle }],
    selectTabDocument: (documentId: string) => {
      const selectedTab = displayedOpenTabs.find((tab) => tab.documentId === documentId);
      rememberOpenTab(displayedOpenTabs, setOpenTabs, {
        documentId,
        title: selectedTab?.title ?? displayedTitle,
      });
      selectDocumentId(documentId as DocumentId);
    },
    selectWorkspaceDocument: (selection: WorkspaceNavigationSelection) => {
      rememberOpenTab(displayedOpenTabs, setOpenTabs, {
        documentId: selection.documentId,
        title: selection.title,
      });
      selectDocumentId(selection.documentId as DocumentId);
    },
  };
}

function rememberOpenTab(
  currentTabs: readonly EditorTabViewModel[],
  setOpenTabs: (tabs: readonly EditorTabViewModel[]) => void,
  nextTab: EditorTabViewModel,
) {
  setOpenTabs(upsertOpenTab(currentTabs, nextTab));
}

function upsertOpenTab(
  tabs: readonly EditorTabViewModel[],
  nextTab: EditorTabViewModel,
): readonly EditorTabViewModel[] {
  const existingIndex = tabs.findIndex((tab) => tab.documentId === nextTab.documentId);
  if (existingIndex === -1) return [...tabs, nextTab];

  return tabs.map((tab) => (tab.documentId === nextTab.documentId ? nextTab : tab));
}
