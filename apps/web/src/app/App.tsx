import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot } from "@/features/editor";
import { HistoryInspectorSlot } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import type { AppFeatureProviders } from "./mock-providers";
import { useProductWorkspaceProviders } from "./product-workspace-providers";

export function App() {
  const productWorkspace = useProductWorkspaceProviders();

  if (productWorkspace.status !== "ready") {
    return <ProductWorkspaceStatus status={productWorkspace.status} />;
  }

  return <ReviewWorkspace providers={productWorkspace.providers} />;
}

function ReviewWorkspace({ providers }: Readonly<{ providers: AppFeatureProviders }>) {
  return (
    <main className="app-shell">
      <WorkspaceNavigationSlot viewModel={providers.workspaceNavigation} />
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        <DocumentContextSlot
          key={`document-context-${providers.editorWorkspace.documentId}`}
          viewModel={providers.documentContext}
        />
        <EditorWorkspaceSlot
          key={`editor-workspace-${providers.editorWorkspace.documentId}`}
          viewModel={providers.editorWorkspace}
          collaborationAdapter={providers.editorCollaborationAdapter}
        />
      </section>
      <HistoryInspectorSlot
        key={`history-inspector-${providers.editorWorkspace.documentId}`}
        viewModel={providers.historyInspector}
      />
    </main>
  );
}

function ProductWorkspaceStatus({ status }: Readonly<{ status: "loading" | "empty" | "error" }>) {
  return (
    <main className="app-shell">
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        {status === "loading"
          ? "Loading workspace"
          : status === "empty"
            ? "No workspace documents available"
            : "Workspace unavailable"}
      </section>
    </main>
  );
}
