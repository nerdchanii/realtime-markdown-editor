import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import type {
  CheckpointDto,
  CheckpointId,
  CheckpointSnapshotInspectDto,
  DocumentId,
  WorkspaceMembershipId,
} from "@rme/contracts";

import {
  createCollaborationCheckpoint,
  createMockApiClient,
  inspectCheckpointSnapshot,
} from "@/lib/api-client";
import { readCurrentEditorMarkdown as readCurrentEditorMarkdownSnapshot } from "@/lib/current-editor-markdown";

import type { HistoryCheckpoint, HistoryInspectorViewModel } from "./types";

export function useHistoryInspectorState(
  viewModel: HistoryInspectorViewModel,
  fallbackCheckpoints: readonly HistoryCheckpoint[],
) {
  const initialCheckpoints = useInitialCheckpoints(viewModel, fallbackCheckpoints);
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(checkpoints[0]?.id);
  const [revisionMessage, setRevisionMessage] = useState("");
  const selected = checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId);

  const selectCheckpoint = useCheckpointSelection(
    checkpoints,
    setCheckpoints,
    setSelectedCheckpointId,
  );
  const publishRevision = useCheckpointPublisher(viewModel, revisionMessage, {
    setCheckpoints,
    setRevisionMessage,
    setSelectedCheckpointId,
  });

  return createHistoryState({
    checkpoints,
    publishRevision,
    revisionMessage,
    selected,
    selectedCheckpointId,
    setRevisionMessage,
    selectCheckpoint,
  });
}

function useInitialCheckpoints(
  viewModel: HistoryInspectorViewModel,
  fallbackCheckpoints: readonly HistoryCheckpoint[],
) {
  return useMemo(
    () => [...(viewModel.checkpoints ?? fallbackCheckpoints)],
    [fallbackCheckpoints, viewModel.checkpoints],
  );
}

function createHistoryState(state: {
  checkpoints: HistoryCheckpoint[];
  publishRevision: () => void;
  revisionMessage: string;
  selected: HistoryCheckpoint | undefined;
  selectedCheckpointId: string | undefined;
  setRevisionMessage: (message: string) => void;
  selectCheckpoint: (checkpointId: string) => void;
}) {
  return { ...state, setSelectedCheckpointId: state.selectCheckpoint };
}

function useCheckpointSelection(
  checkpoints: readonly HistoryCheckpoint[],
  setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>,
  setSelectedCheckpointId: (checkpointId: string) => void,
) {
  return useCallback(
    (checkpointId: string) => {
      setSelectedCheckpointId(checkpointId);
      const checkpoint = checkpoints.find((candidate) => candidate.id === checkpointId);
      if (checkpoint) void refreshSnapshot(checkpoint, setCheckpoints);
    },
    [checkpoints, setCheckpoints, setSelectedCheckpointId],
  );
}

function useCheckpointPublisher(
  viewModel: HistoryInspectorViewModel,
  revisionMessage: string,
  setters: Readonly<{
    setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>;
    setRevisionMessage: (message: string) => void;
    setSelectedCheckpointId: (checkpointId: string) => void;
  }>,
) {
  return useCallback(() => {
    void publishCheckpoint(viewModel, revisionMessage, setters);
  }, [revisionMessage, setters, viewModel]);
}

async function publishCheckpoint(
  viewModel: HistoryInspectorViewModel,
  revisionMessage: string,
  setters: Readonly<{
    setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>;
    setRevisionMessage: (message: string) => void;
    setSelectedCheckpointId: (checkpointId: string) => void;
  }>,
) {
  const checkpoint = await createApiCheckpoint(viewModel, revisionMessage);
  setters.setCheckpoints((current) => [checkpoint, ...current]);
  setters.setSelectedCheckpointId(checkpoint.id);
  setters.setRevisionMessage("");
}

async function createApiCheckpoint(
  viewModel: HistoryInspectorViewModel,
  revisionMessage: string,
): Promise<HistoryCheckpoint> {
  const documentId = viewModel.documentId ?? readRouteDocumentId();
  const authorMembershipId = viewModel.currentMemberId ?? readRouteMemberId();
  const markdownSnapshot = readCurrentEditorMarkdown();
  const response = await createCollaborationCheckpoint(createMockApiClient(), documentId, {
    documentId,
    authorMembershipId,
    message: revisionMessage.trim() || "Untitled revision",
    markdownSnapshot,
    source: "collaboration",
  });

  const checkpoint = mapCheckpoint(response.checkpoint, {
    author: displayNameForMember(authorMembershipId),
    snapshot: markdownSnapshot,
  });
  const snapshot = await inspectCheckpointSnapshot(createMockApiClient(), response.checkpoint.id);

  return { ...checkpoint, snapshot: snapshot.markdownBody };
}

async function refreshSnapshot(
  checkpoint: HistoryCheckpoint,
  setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>,
) {
  const snapshot = await loadSnapshot(checkpoint);
  setCheckpoints((current) =>
    current.map((candidate) =>
      candidate.id === checkpoint.id ? { ...candidate, snapshot } : candidate,
    ),
  );
}

async function loadSnapshot(checkpoint: HistoryCheckpoint) {
  try {
    const snapshot = await inspectCheckpointSnapshot(
      createMockApiClient(),
      checkpoint.id as CheckpointId,
    );
    return mapSnapshot(snapshot);
  } catch {
    return checkpoint.snapshot;
  }
}

function mapCheckpoint(
  checkpoint: CheckpointDto,
  fallback: Readonly<{ author: string; snapshot: string }>,
): HistoryCheckpoint {
  return {
    id: checkpoint.id,
    documentId: checkpoint.documentId,
    message: checkpoint.message,
    author: fallback.author,
    authorMembershipId: checkpoint.authorMembershipId,
    createdAt: checkpoint.createdAt,
    snapshot: fallback.snapshot,
  };
}

function mapSnapshot(snapshot: CheckpointSnapshotInspectDto) {
  return snapshot.markdownBody;
}

function readCurrentEditorMarkdown() {
  return readCurrentEditorMarkdownSnapshot();
}

function readRouteDocumentId(): DocumentId {
  if (typeof window === "undefined") return "document_review_plan" as DocumentId;

  const routeDocument = new URLSearchParams(window.location.search).get("document");
  const documentId =
    routeDocument === "seed-review-plan" || !routeDocument ? "document_review_plan" : routeDocument;

  return documentId as DocumentId;
}

function readRouteMemberId(): WorkspaceMembershipId {
  if (typeof window === "undefined") return "member_alice" as WorkspaceMembershipId;

  const routeMember = new URLSearchParams(window.location.search).get("member") ?? "alice";
  const memberId = routeMember.startsWith("member_") ? routeMember : `member_${routeMember}`;

  return memberId as WorkspaceMembershipId;
}

function displayNameForMember(memberId: string) {
  const label = memberId.replace("member_", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
