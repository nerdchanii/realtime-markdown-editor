import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot } from "@/features/editor";
import { HistoryInspectorSlot } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import { createMockAppProviders } from "./mock-providers";

export function App() {
  const providers = createMockAppProviders();

  return (
    <main className="app-shell">
      <WorkspaceNavigationSlot viewModel={providers.workspaceNavigation} />
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        <DocumentContextSlot viewModel={providers.documentContext} />
        <EditorWorkspaceSlot viewModel={providers.editorWorkspace} />
      </section>
      <HistoryInspectorSlot viewModel={providers.historyInspector} />
    </main>
  );
}
