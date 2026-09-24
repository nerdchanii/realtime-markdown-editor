import { useState } from "react";

import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot } from "@/features/editor";
import { HistoryInspectorSlot } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import { EditorTabs } from "./EditorTabs";
import { TopBar } from "./TopBar";
import { useEditorTabState } from "./editor-tab-state";
import { useHistoryPreviewState } from "./history-preview-state";
import type { ReadyWorkspaceShellState, WorkspaceShellFeatureProviders } from "./types";
import {
  PanelResizeHandle,
  startPanelResize,
  useWorkspaceShellLayout,
} from "./workspace-shell-layout";
import {
  getDisplayedDocumentTitle,
  overrideProviderDocumentTitle,
} from "./workspace-title-projection";

export function ReviewWorkspace({
  state,
  providers,
}: Readonly<{
  state: ReadyWorkspaceShellState;
  providers: WorkspaceShellFeatureProviders;
}>) {
  const shellLayout = useWorkspaceShellLayout();
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [titleDrafts, setTitleDrafts] = useState<Readonly<Record<string, string>>>({});
  const activeDocumentId = providers.editorWorkspace.documentId;
  const displayedTitle = getDisplayedDocumentTitle({
    activeDocumentId,
    documentContextTitle: providers.documentContext.title,
    editorLabel: providers.editorWorkspace.label,
    titleDrafts,
  });
  const renderedProviders = overrideProviderDocumentTitle(
    providers,
    activeDocumentId,
    displayedTitle,
  );
  const tabs = useEditorTabState({
    activeDocumentId,
    displayedTitle,
    selectDocumentId: state.selectDocumentId,
  });
  const historyPreview = useHistoryPreviewState(activeDocumentId);
  const shellProviders = {
    ...renderedProviders,
    workspaceNavigation: {
      ...renderedProviders.workspaceNavigation,
      onSelectDocument: tabs.selectWorkspaceDocument,
    },
  };

  return (
    <main
      className="app-shell app-shell--workspace"
      data-nav-open={shellLayout.isNavigationOpen}
      data-history-open={shellLayout.isHistoryOpen}
      style={shellLayout.appShellStyle}
    >
      <TopBar
        accountSurface={state.accountSurface}
        apiClient={state.apiClient}
        reload={state.reload}
        isNavigationOpen={shellLayout.isNavigationOpen}
        isHistoryOpen={shellLayout.isHistoryOpen}
        onToggleNavigation={shellLayout.toggleNavigation}
        onToggleHistory={shellLayout.toggleHistory}
      />
      {shellLayout.isNavigationOpen ? (
        <WorkspaceNavigationSlot viewModel={shellProviders.workspaceNavigation} />
      ) : null}
      {shellLayout.isNavigationOpen ? (
        <PanelResizeHandle
          ariaLabel="Resize left sidebar"
          edge="left"
          offset={shellLayout.navigationWidth}
          onKeyStep={shellLayout.resizeNavigation}
          onResizeStart={(event) =>
            startPanelResize(event, {
              max: 420,
              min: 180,
              onResize: shellLayout.setNavigationWidth,
              side: "left",
            })
          }
        />
      ) : null}
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        <EditorTabs
          activeDocumentId={activeDocumentId}
          tabs={tabs.fallbackTabs}
          onSelectDocument={tabs.selectTabDocument}
          onCloseDocument={tabs.closeTab}
        />
        <EditorWorkspaceSlot
          key={`editor-workspace-${renderedProviders.editorWorkspace.documentId}`}
          viewModel={renderedProviders.editorWorkspace}
          collaborationAdapter={renderedProviders.editorCollaborationAdapter}
          historyPreview={historyPreview.visibleHistoryPreview}
          onCloseHistoryPreview={historyPreview.closeHistoryPreview}
          onSaved={() => setHistoryRefreshToken((current) => current + 1)}
          headerContent={
            <DocumentContextSlot
              key={`document-context-${renderedProviders.editorWorkspace.documentId}`}
              viewModel={{
                ...renderedProviders.documentContext,
                ...(providers.documentContext.title
                  ? { persistedTitle: providers.documentContext.title }
                  : {}),
                onTitleUpdated: state.reload,
                onTitleDraftChange: (title) => {
                  if (!activeDocumentId) return;
                  setTitleDrafts((current) => ({
                    ...current,
                    [activeDocumentId]: title,
                  }));
                },
              }}
            />
          }
        />
      </section>
      {shellLayout.isHistoryOpen ? (
        <HistoryInspectorSlot
          key={`history-inspector-${renderedProviders.editorWorkspace.documentId}`}
          refreshToken={historyRefreshToken}
          viewModel={renderedProviders.historyInspector}
          onPreviewCheckpoint={historyPreview.previewCheckpoint}
        />
      ) : null}
      {shellLayout.isHistoryOpen ? (
        <PanelResizeHandle
          ariaLabel="Resize right sidebar"
          edge="right"
          offset={shellLayout.historyWidth}
          onKeyStep={shellLayout.resizeHistory}
          onResizeStart={(event) =>
            startPanelResize(event, {
              max: 520,
              min: 220,
              onResize: shellLayout.setHistoryWidth,
              side: "right",
            })
          }
        />
      ) : null}
    </main>
  );
}
