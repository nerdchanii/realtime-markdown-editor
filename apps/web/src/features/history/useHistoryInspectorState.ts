import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

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
  fetchDocumentCheckpoints,
  inspectCheckpointSnapshot,
  updateDocumentContent,
} from "@/lib/api-client";
import { readCurrentEditorMarkdown as readCurrentEditorMarkdownSnapshot } from "@/lib/current-editor-markdown";

import type { HistoryCheckpoint, HistoryInspectorViewModel } from "./types";

export function useHistoryInspectorState(
  viewModel: HistoryInspectorViewModel,
  fallbackCheckpoints: readonly HistoryCheckpoint[],
  refreshToken?: number,
) {
  const initialCheckpoints = useInitialCheckpoints(viewModel, fallbackCheckpoints);
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(checkpoints[0]?.id);
  const [revisionMessage, setRevisionMessage] = useState("");

  useProductCheckpointList(viewModel, setCheckpoints, setSelectedCheckpointId, refreshToken);

  const selectCheckpoint = useCheckpointSelection(
    viewModel,
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
    selected: checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId),
    selectedCheckpointId,
    setRevisionMessage,
    selectCheckpoint,
  });
}

function useProductCheckpointList(
  viewModel: HistoryInspectorViewModel,
  setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>,
  setSelectedCheckpointId: Dispatch<SetStateAction<string | undefined>>,
  refreshToken?: number,
) {
  useEffect(() => {
    if (!viewModel.apiClient || !viewModel.documentId) return;

    let isDisposed = false;
    const refreshCheckpoints = () => {
      void loadProductCheckpoints(viewModel).then(
        (loadedCheckpoints) => {
          if (isDisposed) return;
          setCheckpoints(loadedCheckpoints);
          setSelectedCheckpointId((current) =>
            current && loadedCheckpoints.some((checkpoint) => checkpoint.id === current)
              ? current
              : loadedCheckpoints[0]?.id,
          );
        },
        () => {
          if (isDisposed) return;
          setCheckpoints([]);
          setSelectedCheckpointId(undefined);
        },
      );
    };
    refreshCheckpoints();
    const intervalId = window.setInterval(refreshCheckpoints, productCheckpointPollIntervalMs);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, [
    setCheckpoints,
    setSelectedCheckpointId,
    viewModel,
    viewModel.apiClient,
    viewModel.documentId,
    viewModel.memberLabels,
    refreshToken,
  ]);
}

const productCheckpointPollIntervalMs = 2500;

function useInitialCheckpoints(
  viewModel: HistoryInspectorViewModel,
  fallbackCheckpoints: readonly HistoryCheckpoint[],
) {
  return useMemo(
    () => sortCheckpointsNewestFirst([...(viewModel.checkpoints ?? fallbackCheckpoints)]),
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
  viewModel: HistoryInspectorViewModel,
  checkpoints: readonly HistoryCheckpoint[],
  setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>,
  setSelectedCheckpointId: (checkpointId: string) => void,
) {
  return useCallback(
    (checkpointId: string) => {
      setSelectedCheckpointId(checkpointId);
      const checkpoint = checkpoints.find((candidate) => candidate.id === checkpointId);
      if (checkpoint) void refreshSnapshot(viewModel, checkpoint, setCheckpoints);
    },
    [checkpoints, setCheckpoints, setSelectedCheckpointId, viewModel],
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
  setters.setCheckpoints((current) => upsertCheckpoint(current, checkpoint));
  setters.setSelectedCheckpointId(checkpoint.id);
  setters.setRevisionMessage("");
}

function upsertCheckpoint(
  checkpoints: readonly HistoryCheckpoint[],
  checkpoint: HistoryCheckpoint,
): HistoryCheckpoint[] {
  if (!checkpoints.some((candidate) => candidate.id === checkpoint.id)) {
    return [checkpoint, ...checkpoints];
  }
  return checkpoints.map((candidate) => (candidate.id === checkpoint.id ? checkpoint : candidate));
}

async function createApiCheckpoint(
  viewModel: HistoryInspectorViewModel,
  revisionMessage: string,
): Promise<HistoryCheckpoint> {
  const documentId = viewModel.documentId ?? ("document_review_plan" as DocumentId);
  const authorMembershipId = viewModel.currentMemberId ?? ("member_alice" as WorkspaceMembershipId);
  const markdownSnapshot = readCurrentEditorMarkdown();
  const apiClient = viewModel.apiClient ?? createMockApiClient();

  if (viewModel.apiClient) {
    await updateDocumentContent(apiClient, documentId, {
      markdownBody: markdownSnapshot,
      source: "collaboration-projection",
    });
  }

  const response = await createCollaborationCheckpoint(apiClient, documentId, {
    message: revisionMessage.trim() || "Untitled revision",
  });

  const checkpoint = mapCheckpoint(response.checkpoint, {
    author: displayNameForMember(authorMembershipId, viewModel.memberLabels),
    snapshot: markdownSnapshot,
  });
  const snapshot = await inspectCheckpointSnapshot(apiClient, response.checkpoint.id);

  return { ...checkpoint, snapshot: snapshot.markdownBody };
}

async function loadProductCheckpoints(
  viewModel: HistoryInspectorViewModel,
): Promise<HistoryCheckpoint[]> {
  if (!viewModel.apiClient || !viewModel.documentId) return [];

  const response = await fetchDocumentCheckpoints(viewModel.apiClient, viewModel.documentId);
  const checkpoints = await Promise.all(
    response.checkpoints.map(async (checkpoint) => {
      const mapped = mapCheckpoint(checkpoint, {
        author: displayNameForMember(checkpoint.authorMembershipId, viewModel.memberLabels),
        snapshot: "",
      });
      const snapshot = await inspectCheckpointSnapshot(viewModel.apiClient!, checkpoint.id);
      return { ...mapped, snapshot: snapshot.markdownBody };
    }),
  );
  return sortCheckpointsNewestFirst(checkpoints);
}

async function refreshSnapshot(
  viewModel: HistoryInspectorViewModel,
  checkpoint: HistoryCheckpoint,
  setCheckpoints: Dispatch<SetStateAction<HistoryCheckpoint[]>>,
) {
  const snapshot = await loadSnapshot(viewModel, checkpoint);
  setCheckpoints((current) =>
    current.map((candidate) =>
      candidate.id === checkpoint.id ? { ...candidate, snapshot } : candidate,
    ),
  );
}

async function loadSnapshot(viewModel: HistoryInspectorViewModel, checkpoint: HistoryCheckpoint) {
  try {
    const snapshot = await inspectCheckpointSnapshot(
      viewModel.apiClient ?? createMockApiClient(),
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
    kind: "save",
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

function sortCheckpointsNewestFirst(checkpoints: HistoryCheckpoint[]) {
  return checkpoints.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function readCurrentEditorMarkdown() {
  return readCurrentEditorMarkdownSnapshot();
}

function displayNameForMember(memberId: string, labels?: Readonly<Record<string, string>>) {
  const memberLabel = labels?.[memberId];
  if (memberLabel) return memberLabel;

  const label = memberId.replace("member_", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
