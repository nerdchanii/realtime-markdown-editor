import {
  useEffect,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from "react";
import type { DocumentId } from "@rme/contracts";

import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot, type EditorHistoryPreview } from "@/features/editor";
import { HistoryInspectorSlot, type HistoryCheckpoint } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import { AuthScreen } from "./AuthScreen";
import { EditorTabs, type EditorTabViewModel } from "./EditorTabs";
import { FirstWorkspaceForm } from "./FirstWorkspaceForm";
import { TopBar } from "./TopBar";
import { useProductWorkspaceProviders } from "./product-workspace-providers";
import type { AppFeatureProviders } from "./mock-providers";
import type { ProductWorkspaceState } from "./product-workspace-types";
import type {
  WorkspaceNavigationNode,
  WorkspaceNavigationProject,
  WorkspaceNavigationViewModel,
} from "@/features/workspace";

export function App() {
  const productWorkspace = useProductWorkspaceProviders();
  const [openTabs, setOpenTabs] = useState<readonly EditorTabViewModel[]>([]);

  if (productWorkspace.status === "unauthenticated") {
    return <AuthScreen apiClient={productWorkspace.apiClient} reload={productWorkspace.reload} />;
  }

  if (productWorkspace.status !== "ready") {
    return <ProductWorkspaceStatus state={productWorkspace} />;
  }

  return (
    <ReviewWorkspace
      state={productWorkspace}
      providers={productWorkspace.providers}
      openTabs={openTabs}
      setOpenTabs={setOpenTabs}
    />
  );
}

function ReviewWorkspace({
  state,
  providers,
  openTabs,
  setOpenTabs,
}: Readonly<{
  state: Extract<ProductWorkspaceState, { status: "ready" }>;
  providers: AppFeatureProviders;
  openTabs: readonly EditorTabViewModel[];
  setOpenTabs: Dispatch<SetStateAction<readonly EditorTabViewModel[]>>;
}>) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [navigationWidth, setNavigationWidth] = useState(260);
  const [historyWidth, setHistoryWidth] = useState(320);
  const [historyPreview, setHistoryPreview] = useState<Readonly<{
    documentId: string;
    preview: EditorHistoryPreview;
  }> | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [titleDrafts, setTitleDrafts] = useState<Readonly<Record<string, string>>>({});
  const activeDocumentId = providers.editorWorkspace.documentId;
  const displayedTitle = activeDocumentId
    ? (titleDrafts[activeDocumentId] ??
      providers.documentContext.title ??
      providers.editorWorkspace.label)
    : (providers.documentContext.title ?? providers.editorWorkspace.label);
  const renderedProviders = overrideProviderDocumentTitle(
    providers,
    activeDocumentId,
    displayedTitle,
  );
  const appShellStyle = {
    "--layout-sidebar-width": `${navigationWidth}px`,
    "--layout-inspector-width": `${historyWidth}px`,
  } as CSSProperties;

  const visibleHistoryPreview = historyPreview
    ? getVisibleHistoryPreview(historyPreview, activeDocumentId)
    : null;
  const displayedOpenTabs = activeDocumentId
    ? upsertOpenTab(openTabs, {
        documentId: activeDocumentId,
        title: displayedTitle,
      })
    : openTabs;

  useEffect(() => {
    if (!activeDocumentId) return;
    setOpenTabs((current) =>
      upsertOpenTab(current, {
        documentId: activeDocumentId,
        title: displayedTitle,
      }),
    );
  }, [activeDocumentId, displayedTitle, setOpenTabs]);

  return (
    <main
      className="app-shell app-shell--workspace"
      data-nav-open={isNavigationOpen}
      data-history-open={isHistoryOpen}
      style={appShellStyle}
    >
      <TopBar
        accountSurface={state.accountSurface}
        apiClient={state.apiClient}
        reload={state.reload}
        isNavigationOpen={isNavigationOpen}
        isHistoryOpen={isHistoryOpen}
        onToggleNavigation={() => setIsNavigationOpen((current) => !current)}
        onToggleHistory={() => setIsHistoryOpen((current) => !current)}
      />
      {isNavigationOpen ? (
        <WorkspaceNavigationSlot viewModel={renderedProviders.workspaceNavigation} />
      ) : null}
      {isNavigationOpen ? (
        <PanelResizeHandle
          ariaLabel="Resize left sidebar"
          edge="left"
          offset={navigationWidth}
          onKeyStep={(delta) =>
            setNavigationWidth((current) => clampPanelWidth(current + delta, 180, 420))
          }
          onResizeStart={(event) =>
            startPanelResize(event, {
              max: 420,
              min: 180,
              onResize: setNavigationWidth,
              side: "left",
            })
          }
        />
      ) : null}
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        <EditorTabs
          activeDocumentId={activeDocumentId}
          tabs={
            displayedOpenTabs.length
              ? displayedOpenTabs
              : activeDocumentId
                ? [{ documentId: activeDocumentId, title: displayedTitle }]
                : []
          }
          onSelectDocument={(documentId) => state.selectDocumentId(documentId as DocumentId)}
          onCloseDocument={(documentId) => {
            const nextTabs = displayedOpenTabs.filter((tab) => tab.documentId !== documentId);
            setOpenTabs(nextTabs);
            if (documentId === activeDocumentId && nextTabs[0]) {
              state.selectDocumentId(nextTabs[0].documentId as DocumentId);
            }
          }}
        />
        <EditorWorkspaceSlot
          key={`editor-workspace-${renderedProviders.editorWorkspace.documentId}`}
          viewModel={renderedProviders.editorWorkspace}
          collaborationAdapter={renderedProviders.editorCollaborationAdapter}
          historyPreview={visibleHistoryPreview}
          onCloseHistoryPreview={() => setHistoryPreview(null)}
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
      {isHistoryOpen ? (
        <HistoryInspectorSlot
          key={`history-inspector-${renderedProviders.editorWorkspace.documentId}`}
          refreshToken={historyRefreshToken}
          viewModel={renderedProviders.historyInspector}
          onPreviewCheckpoint={(checkpoint) => {
            if (!activeDocumentId) return;
            setHistoryPreview({
              documentId: activeDocumentId,
              preview: createEditorHistoryPreview(checkpoint),
            });
          }}
        />
      ) : null}
      {isHistoryOpen ? (
        <PanelResizeHandle
          ariaLabel="Resize right sidebar"
          edge="right"
          offset={historyWidth}
          onKeyStep={(delta) =>
            setHistoryWidth((current) => clampPanelWidth(current - delta, 220, 520))
          }
          onResizeStart={(event) =>
            startPanelResize(event, {
              max: 520,
              min: 220,
              onResize: setHistoryWidth,
              side: "right",
            })
          }
        />
      ) : null}
    </main>
  );
}

function getVisibleHistoryPreview(
  historyPreview: Readonly<{
    documentId: string;
    preview: EditorHistoryPreview;
  }>,
  activeDocumentId: string | undefined,
) {
  return historyPreview.documentId === activeDocumentId ? historyPreview.preview : null;
}

function PanelResizeHandle({
  ariaLabel,
  edge,
  offset,
  onKeyStep,
  onResizeStart,
}: Readonly<{
  ariaLabel: string;
  edge: "left" | "right";
  offset: number;
  onKeyStep: (delta: number) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}>) {
  return (
    // The resize separator is intentionally pointer- and keyboard-draggable.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      aria-label={ariaLabel}
      className={`panel-resize-handle panel-resize-handle--${edge}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onKeyStep(-16);
        if (event.key === "ArrowRight") onKeyStep(16);
      }}
      onPointerDown={onResizeStart}
      role="separator"
      style={edge === "left" ? { left: `${offset}px` } : { right: `${offset}px` }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    />
  );
}

function startPanelResize(
  event: PointerEvent<HTMLElement>,
  input: Readonly<{
    min: number;
    max: number;
    side: "left" | "right";
    onResize: (width: number) => void;
  }>,
) {
  event.preventDefault();

  const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
    const nextWidth =
      input.side === "left" ? moveEvent.clientX : window.innerWidth - moveEvent.clientX;
    input.onResize(clampPanelWidth(nextWidth, input.min, input.max));
  };

  const handlePointerUp = () => {
    document.body.classList.remove("is-resizing-panel");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  document.body.classList.add("is-resizing-panel");
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp, { once: true });
}

function clampPanelWidth(width: number, min: number, max: number) {
  return Math.min(Math.max(width, min), max);
}

function upsertOpenTab(
  tabs: readonly EditorTabViewModel[],
  nextTab: EditorTabViewModel,
): readonly EditorTabViewModel[] {
  const existingIndex = tabs.findIndex((tab) => tab.documentId === nextTab.documentId);
  if (existingIndex === -1) return [...tabs, nextTab];

  return tabs.map((tab) => (tab.documentId === nextTab.documentId ? nextTab : tab));
}

function overrideProviderDocumentTitle(
  providers: AppFeatureProviders,
  documentId: string | undefined,
  title: string,
): AppFeatureProviders {
  if (!documentId) return providers;

  return {
    ...providers,
    workspaceNavigation: overrideWorkspaceNavigationTitle(
      providers.workspaceNavigation,
      documentId,
      title,
    ),
    documentContext: {
      ...providers.documentContext,
      title,
    },
    editorWorkspace: {
      ...providers.editorWorkspace,
      label: title,
    },
  };
}

function overrideWorkspaceNavigationTitle(
  viewModel: WorkspaceNavigationViewModel,
  documentId: string,
  title: string,
): WorkspaceNavigationViewModel {
  return {
    ...viewModel,
    ...(viewModel.root
      ? { root: overrideWorkspaceNodeTitle(viewModel.root, documentId, title) }
      : {}),
    ...(viewModel.projects
      ? {
          projects: viewModel.projects.map((project) =>
            overrideWorkspaceProjectTitle(project, documentId, title),
          ),
        }
      : {}),
  };
}

function overrideWorkspaceProjectTitle(
  project: WorkspaceNavigationProject,
  documentId: string,
  title: string,
): WorkspaceNavigationProject {
  return {
    ...project,
    root: overrideWorkspaceNodeTitle(project.root, documentId, title),
  };
}

function overrideWorkspaceNodeTitle(
  node: WorkspaceNavigationNode,
  documentId: string,
  title: string,
): WorkspaceNavigationNode {
  const nextName = node.kind === "document" && node.id === documentId ? title : node.name;
  const nextChildren = node.children?.map((child) =>
    overrideWorkspaceNodeTitle(child, documentId, title),
  );

  return {
    ...node,
    name: nextName,
    ...(nextChildren ? { children: nextChildren } : {}),
  };
}

function createEditorHistoryPreview(checkpoint: HistoryCheckpoint): EditorHistoryPreview {
  return {
    checkpointId: checkpoint.id,
    label: checkpoint.message.trim() || "Saved revision",
    markdown: checkpoint.snapshot,
  };
}

function ProductWorkspaceStatus({
  state,
}: Readonly<{ state: Exclude<ProductWorkspaceState, { status: "ready" | "unauthenticated" }> }>) {
  return (
    <main className="app-shell app-shell--workspace">
      <TopBar
        apiClient={state.apiClient}
        reload={state.reload}
        isNavigationOpen
        isHistoryOpen
        onToggleNavigation={() => {}}
        onToggleHistory={() => {}}
      />
      <section
        className="editor-panel"
        aria-label="Collaborative Markdown editor workspace"
        style={{
          gridColumn: "2 / 3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {state.status === "loading" ? (
          "Loading workspace..."
        ) : state.status === "empty" ? (
          "No workspace documents available."
        ) : state.status === "no-workspace" ? (
          <FirstWorkspaceForm state={state} />
        ) : (
          "Workspace unavailable"
        )}
      </section>
    </main>
  );
}
