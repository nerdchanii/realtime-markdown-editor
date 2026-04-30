import type { CollaborationSessionDto } from "@rme/contracts";
import type { AnyExtension } from "@tiptap/core";

export type SyncStatusViewModel = Readonly<{
  label: string;
  detail: string;
  pendingEdits: number;
}>;

export type PresenceMember = Readonly<{
  id: string;
  name: string;
  color: string;
  range: string;
  anchor?: number;
  head?: number;
}>;

export type EditorSelectionSnapshot = Readonly<{
  anchor: number;
  head: number;
}>;

export type CollaborationDocumentOptions = Readonly<{
  documentId: string;
  initialMarkdown: string;
  initialSyncStatus: SyncStatusViewModel;
  initialPresence: readonly PresenceMember[];
  session?: CollaborationSessionDto;
}>;

export type CollaborationDocumentState = Readonly<{
  markdown: string;
  updateMarkdown: (markdown: string) => void;
  updateSelection: (selection: EditorSelectionSnapshot) => void;
  editorExtensions?: readonly AnyExtension[] | undefined;
  bootstrapMarkdown?: string | undefined;
  syncStatus: SyncStatusViewModel;
  presence: readonly PresenceMember[];
  providerName: string;
}>;

export type CollaborationAdapter = Readonly<{
  providerName: string;
  useDocument: (options: CollaborationDocumentOptions) => CollaborationDocumentState;
}>;
