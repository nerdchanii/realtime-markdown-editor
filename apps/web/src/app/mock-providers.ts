import { createMockApiClient } from "@/lib/api-client";

import type { DocumentContextViewModel } from "@/features/document";
import {
  createMockCollaborationAdapter,
  type CollaborationAdapter,
  type EditorWorkspaceViewModel,
} from "@/features/editor";
import type { HistoryInspectorViewModel } from "@/features/history";
import type { WorkspaceNavigationViewModel } from "@/features/workspace";

export const appMockProviderReplacementPoint = "app.providers.mock";

export type AppFeatureProviders = Readonly<{
  workspaceNavigation: WorkspaceNavigationViewModel;
  documentContext: DocumentContextViewModel;
  editorWorkspace: EditorWorkspaceViewModel;
  editorCollaborationAdapter: CollaborationAdapter;
  historyInspector: HistoryInspectorViewModel;
}>;

const workspaceNavigation: WorkspaceNavigationViewModel = {
  replacementPoint: "features.workspace.provider.mock",
  label: "Navigation slot",
};

const editorWorkspace: EditorWorkspaceViewModel = {
  replacementPoint: "features.editor.provider.mock",
  label: "Editor slot",
};

const historyInspector: HistoryInspectorViewModel = {
  replacementPoint: "features.history.provider.mock",
  label: "History slot",
};

export function createMockAppProviders(): AppFeatureProviders {
  const apiClient = createMockApiClient();

  return {
    workspaceNavigation,
    documentContext: {
      replacementPoint: "features.document.provider.mock",
      label: `Document slot via ${apiClient.providerName}`,
    },
    editorWorkspace,
    editorCollaborationAdapter: createMockCollaborationAdapter(),
    historyInspector,
  };
}
