import type { DocumentId } from "@rme/contracts";

import type { DocumentContextViewModel } from "@/features/document";
import type { CollaborationAdapter, EditorWorkspaceViewModel } from "@/features/editor";
import type { HistoryInspectorViewModel } from "@/features/history";
import type { SettingsAccountSurface } from "@/features/settings";
import type { WorkspaceNavigationViewModel } from "@/features/workspace";
import type { ApiClient } from "@/lib/api-client";

export type WorkspaceShellFeatureProviders = Readonly<{
  workspaceNavigation: WorkspaceNavigationViewModel;
  documentContext: DocumentContextViewModel;
  editorWorkspace: EditorWorkspaceViewModel;
  editorCollaborationAdapter: CollaborationAdapter;
  historyInspector: HistoryInspectorViewModel;
}>;

export type WorkspaceShellAccountSurface = SettingsAccountSurface;

export type ReadyWorkspaceShellState = Readonly<{
  accountSurface?: WorkspaceShellAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
  selectDocumentId: (documentId: DocumentId) => void;
}>;

export type WorkspaceShellStatusState = Readonly<{
  accountSurface?: WorkspaceShellAccountSurface | undefined;
  apiClient: ApiClient;
  reload: () => void;
  status: "loading" | "empty" | "no-workspace" | "error";
}>;
