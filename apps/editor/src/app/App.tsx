import { useCallback, useEffect, useState } from "react";

import { useDocumentList, useOpenDocument } from "../core/hooks";
import type { LocalWorkspace } from "../core/local-workspace";
import { readPreference, writePreference } from "../core/preferences";
import { DocumentView, EmptyDocument } from "../features/document/DocumentView";
import { MarkdownEditor } from "../features/editor/MarkdownEditor";
import { Explorer } from "../features/explorer/Explorer";
import { Shell, type Theme } from "../layouts/shell/Shell";
import { markdownType } from "../types/markdown/module";

interface AppProps {
  workspace: LocalWorkspace;
}

export function App({ workspace }: AppProps) {
  const entries = useDocumentList(workspace);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const last = readPreference("last-document", "");
    return entries.some((entry) => entry.id === last) ? last : (entries[0]?.id ?? null);
  });
  const doc = useOpenDocument(workspace, selectedId);
  const [theme, setTheme] = useState<Theme>(() =>
    readPreference("theme", "dark") === "light" ? "light" : "dark",
  );
  const [explorerOpen, setExplorerOpen] = useState(
    () => readPreference("explorer-open", "true") === "true",
  );

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    writePreference("theme", theme);
  }, [theme]);
  useEffect(() => writePreference("explorer-open", String(explorerOpen)), [explorerOpen]);
  useEffect(() => {
    if (selectedId) writePreference("last-document", selectedId);
  }, [selectedId]);

  const toggleExplorer = useCallback(() => setExplorerOpen((open) => !open), []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        toggleExplorer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleExplorer]);

  const createDocument = useCallback(async () => {
    const entry = await workspace.createDocument(markdownType);
    setSelectedId(entry.id);
  }, [workspace]);

  function mainContent() {
    // While the selected document is opening, show nothing rather than the previous document,
    // so input can never land on a document the user already left.
    if (selectedId && doc?.guid !== selectedId) return null;
    if (!doc) {
      return (
        <EmptyDocument hasDocuments={entries.length > 0} onCreate={() => void createDocument()} />
      );
    }
    return (
      <DocumentView key={doc.guid} doc={doc}>
        <MarkdownEditor doc={doc} />
      </DocumentView>
    );
  }

  return (
    <Shell
      explorerOpen={explorerOpen}
      onToggleExplorer={toggleExplorer}
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      explorer={
        <Explorer
          workspace={workspace}
          entries={entries}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => void createDocument()}
        />
      }
    >
      {mainContent()}
    </Shell>
  );
}
