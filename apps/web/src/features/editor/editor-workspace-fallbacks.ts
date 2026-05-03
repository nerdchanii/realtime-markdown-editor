import type { PresenceMember, SyncStatusViewModel } from "./ports/collaboration-adapter";

export const fallbackMarkdown = `# Architecture collaboration notes

This workspace keeps team documentation close to the people editing it.

- Capture architecture decisions while the team is editing.
- Use checkpoints before major document changes.
- Keep links and backlinks visible beside the writing surface.

\`\`\`ts
const workspace = "atlas";
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
