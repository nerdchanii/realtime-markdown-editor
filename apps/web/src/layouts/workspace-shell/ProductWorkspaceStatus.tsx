import { FirstWorkspaceForm } from "@/features/workspace";

import { TopBar } from "./TopBar";
import type { WorkspaceShellStatusState } from "./types";

export function ProductWorkspaceStatus({ state }: Readonly<{ state: WorkspaceShellStatusState }>) {
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
          <FirstWorkspaceForm apiClient={state.apiClient} reload={state.reload} />
        ) : (
          "Workspace unavailable"
        )}
      </section>
    </main>
  );
}
