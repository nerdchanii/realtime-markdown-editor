import type { WorkspaceDocumentRef } from "./adapter-contract";
import {
  POC_FOLDER_ID,
  POC_PROJECT_ID,
  POC_WORKSPACE_ID,
} from "./member-identities";

export const POC_DOCUMENT_ID = "document-launch-readiness-brief";
export const POC_DOCUMENT_TITLE = "Launch Readiness Brief";

export const POC_DOCUMENT_REF = {
  workspaceId: POC_WORKSPACE_ID,
  projectId: POC_PROJECT_ID,
  folderId: POC_FOLDER_ID,
  documentId: POC_DOCUMENT_ID,
  title: POC_DOCUMENT_TITLE,
} as const satisfies WorkspaceDocumentRef;

export const POC_MARKDOWN_ANCHORS = {
  concurrentAlice:
    "- Client A anchor: keep the release goal visible while another member edits elsewhere.",
  concurrentBob:
    "- Client B anchor: preserve the risk list while another member edits elsewhere.",
  offlineLocal:
    "- Local offline anchor: add the disconnected client note below this item.",
  offlineRemote:
    "- Remote online anchor: add the still-connected client note below this item.",
  revisionCheckpoint:
    "The first checkpoint should capture the brief before scenario edits.",
} as const;

export const POC_EDIT_SNIPPETS = {
  concurrentAlice:
    "\n- Alice adds CE-01 evidence: the release goal stays visible after sync.",
  concurrentBob:
    "\n- Bob adds CE-01 evidence: the risk list stays visible after sync.",
  offlineLocal:
    "\n- Alice adds CE-03 evidence while offline: local work survives reconnect.",
  offlineRemote:
    "\n- Bob adds CE-03 evidence while online: remote work merges after reconnect.",
  revisionAfterCheckpoint:
    "\n- Cora adds CE-04 evidence: the checkpoint list exposes earlier content.",
} as const;

export const SEEDED_MARKDOWN = `# Launch Readiness Brief

The collaboration POC uses this document to prove concurrent editing, presence,
offline merge, revision history, and rich preview without provider-specific
fixtures.

## Decision Context

The first product skeleton must keep the editor path easy to review.
The first checkpoint should capture the brief before scenario edits.

## Concurrent Edit Zone

Use this section for two-member simultaneous editing.

${POC_MARKDOWN_ANCHORS.concurrentAlice}
${POC_MARKDOWN_ANCHORS.concurrentBob}

## Offline Merge Zone

Use this section for open-page disconnect and reconnect behavior.

${POC_MARKDOWN_ANCHORS.offlineLocal}
${POC_MARKDOWN_ANCHORS.offlineRemote}

## Review Checklist

- Confirm both browser sessions converge without manual refresh.
- Confirm remote cursor labels use seeded member names and colors.
- Confirm disconnected local edits and connected remote edits both remain.
- Confirm history exposes an earlier Markdown snapshot.

## Preview Coverage

| Requirement | Preview evidence |
| --- | --- |
| CE-05 | Heading, list, table, link, and code block render from Markdown source. |

See ADR-0002 for the selected collaboration engine.

\`\`\`ts
export const previewSmokeCheck = "Markdown code blocks render in rich preview";
\`\`\`
`;

export const SEEDED_MARKDOWN_FIXTURE = {
  document: POC_DOCUMENT_REF,
  title: POC_DOCUMENT_TITLE,
  markdown: SEEDED_MARKDOWN,
  anchors: POC_MARKDOWN_ANCHORS,
  editSnippets: POC_EDIT_SNIPPETS,
  expectedPreview: {
    headings: [
      "Launch Readiness Brief",
      "Decision Context",
      "Concurrent Edit Zone",
      "Offline Merge Zone",
      "Review Checklist",
      "Preview Coverage",
    ],
    links: ["./decision-log.md"],
    tableCells: ["Requirement", "Preview evidence", "CE-05"],
    codeBlocks: [
      'export const previewSmokeCheck = "Markdown code blocks render in rich preview";',
    ],
  },
} as const;
