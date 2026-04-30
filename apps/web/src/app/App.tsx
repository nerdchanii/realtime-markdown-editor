import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { DocumentContextSlot } from "@/features/document";
import { EditorWorkspaceSlot } from "@/features/editor";
import { HistoryInspectorSlot } from "@/features/history";
import { WorkspaceNavigationSlot } from "@/features/workspace";

import type { CreatedReviewDocument } from "./created-review-document";
import { readReviewerRoute } from "./reviewer-route";
import { createSeedReviewProviders } from "./seed-review-context-adapter";
import { useSeedReviewContext } from "./useSeedReviewContext";

type SeedReviewProviders = ReturnType<typeof createSeedReviewProviders>;

export function App() {
  const route = useMemo(() => readReviewerRoute(), []);
  const seedContext = useSeedReviewContext();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [createdDocuments, setCreatedDocuments] = useState<readonly CreatedReviewDocument[]>([]);
  const selectDocument = useCallback((selection: { documentId: string }) => {
    setSelectedDocumentId(selection.documentId);
  }, []);
  const createDocument = useLocalDocumentCreator(seedContext, createdDocuments.length, {
    setCreatedDocuments,
    setSelectedDocumentId,
  });

  if (seedContext.status !== "ready") {
    return <ReviewContextStatus status={seedContext.status} />;
  }

  const providers = createSeedReviewProviders(
    seedContext.context,
    route,
    selectedDocumentId,
    selectDocument,
    createdDocuments,
    createDocument,
  );

  return <ReviewWorkspace providers={providers} />;
}

function useLocalDocumentCreator(
  seedContext: ReturnType<typeof useSeedReviewContext>,
  createdDocumentCount: number,
  setters: Readonly<{
    setCreatedDocuments: Dispatch<SetStateAction<readonly CreatedReviewDocument[]>>;
    setSelectedDocumentId: (documentId: string) => void;
  }>,
) {
  return useCallback(
    (request: { title: string; folderId?: string | null; projectId?: string | null }) => {
      if (seedContext.status !== "ready") return;

      const id = `document_local_${createdDocumentCount + 1}`;
      const folderId = request.folderId ?? seedContext.context.project.rootFolderId;
      setters.setCreatedDocuments((current) => [
        ...current,
        createLocalDocument(request, id, folderId),
      ]);
      setters.setSelectedDocumentId(id);
    },
    [createdDocumentCount, seedContext, setters],
  );
}

function createLocalDocument(
  request: { title: string; projectId?: string | null },
  id: string,
  folderId: string,
): CreatedReviewDocument {
  return {
    id,
    title: request.title,
    folderId,
    projectId: request.projectId ?? null,
    markdownBody: `# ${request.title}\n\nStart writing here.`,
  };
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
