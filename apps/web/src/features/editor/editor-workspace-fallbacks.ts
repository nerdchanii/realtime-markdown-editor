import type { PresenceMember, SyncStatusViewModel } from "./ports/collaboration-adapter";

export const fallbackMarkdown = `# Collaborative editor review plan

This Markdown body is the portable CE evidence path.

- CE-01 keeps concurrent edits in the central editor.
- CE-04 exposes checkpoints in the history slot.
- CE-05 uses the rich authoring surface as the rendered Markdown view.

\`\`\`ts
const editorSurface = "mock-backed";
\`\`\`

| Surface | Status |
| --- | --- |
| Properties | Outside body |
| Backlinks | Visible |
`;

export const fallbackSyncStatus: SyncStatusViewModel = {
  label: "Synced",
  detail: "Mock provider, 0 pending local edits",
  pendingEdits: 0,
};

export const fallbackPresence: readonly PresenceMember[] = [
  { id: "alice", name: "Alice", color: "#0969da", range: "line 3" },
  { id: "bob", name: "Bob", color: "#1a7f37", range: "table block" },
];
