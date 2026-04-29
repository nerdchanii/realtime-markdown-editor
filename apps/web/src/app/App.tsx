import { useMemo, useState } from "react";

import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot } from "@/features/editor";
import { HistoryInspectorSlot } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import { readReviewerRoute } from "./reviewer-route";
import { createSeedReviewProviders } from "./seed-review-context-adapter";
import { useSeedReviewContext } from "./useSeedReviewContext";

type SeedReviewProviders = ReturnType<typeof createSeedReviewProviders>;

export function App() {
  const route = useMemo(() => readReviewerRoute(), []);
  const seedContext = useSeedReviewContext();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  if (seedContext.status !== "ready") {
    return <ReviewContextStatus status={seedContext.status} />;
  }

  const providers = createSeedReviewProviders(
    seedContext.context,
    route,
    selectedDocumentId,
    (selection) => setSelectedDocumentId(selection.documentId),
  );

  return <ReviewWorkspace providers={providers} />;
}

function ReviewWorkspace({ providers }: Readonly<{ providers: SeedReviewProviders }>) {
  return (
    <main className="app-shell">
      <WorkspaceNavigationSlot viewModel={providers.workspaceNavigation} />
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        <DocumentContextSlot viewModel={providers.documentContext} />
        <EditorWorkspaceSlot
          key={providers.editorWorkspace.documentId}
          viewModel={providers.editorWorkspace}
          collaborationAdapter={providers.editorCollaborationAdapter}
        />
      </section>
      <HistoryInspectorSlot
        key={providers.editorWorkspace.documentId}
        viewModel={providers.historyInspector}
      />
    </main>
  );
}

function ReviewContextStatus({ status }: Readonly<{ status: "loading" | "error" }>) {
  return (
    <main className="app-shell">
      <section className="editor-panel" aria-label="Collaborative Markdown editor workspace">
        {status === "loading" ? "Loading review context" : "Review context unavailable"}
      </section>
    </main>
  );
}
