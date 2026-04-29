/**
 * Provider-neutral contract for collaboration POC adapters.
 *
 * This file intentionally has no runtime imports and no provider-specific
 * document, transaction, awareness, selection, or transport types. Prototype
 * adapters translate their editor and sync internals into this shape.
 */

export type PocRequirementId =
  | "CE-01-CONCURRENT-EDITING"
  | "CE-02-PRESENCE"
  | "CE-03-OFFLINE-MERGE"
  | "CE-04-REVISION-HISTORY"
  | "CE-05-RICH-PREVIEW"
  | "REQ-COLLAB-ENGINE-ADAPTER";

export type WorkspaceId = string;
export type ProjectId = string;
export type FolderId = string;
export type DocumentId = string;
export type MemberId = string;
export type RevisionId = string;
export type IsoTimestamp = string;
export type Dispose = () => void;

export type NetworkAvailability = "online" | "offline";
export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "synced"
  | "closed"
  | "error";
export type EditorMode = "source" | "rich" | "split";

export interface WorkspaceDocumentRef {
  workspaceId: WorkspaceId;
  projectId: ProjectId;
  folderId: FolderId;
  documentId: DocumentId;
  title: string;
}

export interface MemberIdentity {
  memberId: MemberId;
  userId: string;
  workspaceId: WorkspaceId;
  displayName: string;
  color: `#${string}`;
  initials: string;
  role: "owner" | "editor" | "reviewer";
}

/**
 * Zero-based UTF-16 offsets in the Markdown source string.
 * `start` is inclusive and `end` is exclusive.
 */
export interface MarkdownOffsetRange {
  start: number;
  end: number;
}

export interface MarkdownSelection {
  anchor: number;
  focus: number;
}

export interface PresenceState {
  memberId: MemberId;
  documentId: DocumentId;
  cursor?: number;
  selection?: MarkdownSelection;
  isFocused: boolean;
  updatedAt?: IsoTimestamp;
}

export interface MarkdownTextChange {
  changeId: string;
  memberId: MemberId;
  range: MarkdownOffsetRange;
  insertText: string;
  expectedDeletedText?: string;
  createdAt?: IsoTimestamp;
  description?: string;
}

export interface RevisionSummary {
  revisionId: RevisionId;
  documentId: DocumentId;
  authorMemberId: MemberId;
  message: string;
  createdAt: IsoTimestamp;
}

export interface RevisionSnapshot extends RevisionSummary {
  markdown: string;
}

export interface RenderedMarkdownSnapshot {
  mode: EditorMode;
  sourceMarkdown: string;
  plainText: string;
  headingTexts: readonly string[];
  linkHrefs: readonly string[];
  tableCellTexts: readonly string[];
  codeBlockTexts: readonly string[];
  capturedAt?: IsoTimestamp;
}

export interface CollaborationAdapterCapabilities {
  concurrentEditing: boolean;
  remotePresence: boolean;
  offlineMerge: boolean;
  revisionHistory: boolean;
  richPreview: boolean;
  markdownSourceMode: boolean;
  splitMode: boolean;
}

export interface PocOpenDocumentInput {
  document: WorkspaceDocumentRef;
  initialMarkdown: string;
  localMember: MemberIdentity;
  knownMembers: readonly MemberIdentity[];
}

export interface CollaborationPocEventMap {
  markdownChanged: {
    documentId: DocumentId;
    markdown: string;
    sourceMemberId?: MemberId;
  };
  presenceChanged: {
    documentId: DocumentId;
    presence: readonly PresenceState[];
  };
  connectionChanged: {
    documentId: DocumentId;
    state: ConnectionState;
  };
  revisionCreated: {
    documentId: DocumentId;
    revision: RevisionSummary;
  };
  error: {
    documentId: DocumentId;
    message: string;
    cause?: unknown;
  };
}

export interface CollaborationPocAdapter {
  readonly adapterId: string;
  readonly displayName: string;
  readonly capabilities: CollaborationAdapterCapabilities;

  openDocument(input: PocOpenDocumentInput): Promise<CollaborationPocSession>;
}

export interface CollaborationPocSession {
  readonly document: WorkspaceDocumentRef;
  readonly localMember: MemberIdentity;

  getMarkdown(): Promise<string>;
  applyMarkdownChange(change: MarkdownTextChange): Promise<void>;
  replaceMarkdown(markdown: string, memberId: MemberId): Promise<void>;

  updatePresence(presence: PresenceState): Promise<void>;
  getRemotePresence(): Promise<readonly PresenceState[]>;

  createRevision(input: {
    authorMemberId: MemberId;
    message: string;
    createdAt?: IsoTimestamp;
  }): Promise<RevisionSummary>;
  listRevisions(): Promise<readonly RevisionSummary[]>;
  readRevision(revisionId: RevisionId): Promise<RevisionSnapshot>;

  setNetworkAvailability(availability: NetworkAvailability): Promise<void>;
  waitForSynced(options?: { timeoutMs?: number }): Promise<void>;

  renderMarkdown(mode: EditorMode): Promise<RenderedMarkdownSnapshot>;

  on<EventName extends keyof CollaborationPocEventMap>(
    eventName: EventName,
    listener: (event: CollaborationPocEventMap[EventName]) => void,
  ): Dispose;

  close(): Promise<void>;
}

export function createMarkdownInsertionChange(input: {
  changeId: string;
  memberId: MemberId;
  markdown: string;
  insertAfter: string;
  insertText: string;
  createdAt?: IsoTimestamp;
  description?: string;
}): MarkdownTextChange {
  const anchorIndex = input.markdown.indexOf(input.insertAfter);

  if (anchorIndex < 0) {
    throw new Error(`Markdown anchor not found: ${input.insertAfter}`);
  }

  const insertAt = anchorIndex + input.insertAfter.length;

  const change: MarkdownTextChange = {
    changeId: input.changeId,
    memberId: input.memberId,
    range: { start: insertAt, end: insertAt },
    insertText: input.insertText,
  };

  if (input.createdAt !== undefined) {
    change.createdAt = input.createdAt;
  }

  if (input.description !== undefined) {
    change.description = input.description;
  }

  return change;
}
