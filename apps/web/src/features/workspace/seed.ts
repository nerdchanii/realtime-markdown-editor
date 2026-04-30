import type { NormalizedWorkspaceNavigationViewModel } from "./types";

export const seededNavigationModel = {
  replacementPoint: "features.workspace.provider.mock",
  label: "Review Team Workspace",
  workspaceId: "workspace:review-team",
  workspaceName: "Review Team Workspace",
  workspaceDescription: "Seeded workspace for CE-01 through CE-05 review paths.",
  activeMembersLabel: "3 members online",
  currentMemberLabel: "Editing as seeded reviewer",
  selectedDocumentId: "doc:launch-review-plan",
  root: {
    id: "folder:workspace-root",
    kind: "workspaceRoot",
    name: "Workspace root",
    children: [
      {
        id: "folder:workspace-inbox",
        kind: "inbox",
        name: "Team Inbox",
        children: [
          {
            id: "doc:review-kickoff",
            kind: "document",
            name: "Review kickoff notes",
            folderId: "folder:workspace-inbox",
            status: "Draft",
            updatedLabel: "Updated today",
            ownerLabel: "Yuna",
          },
        ],
      },
    ],
  },
  projects: [
    {
      id: "project:collab-editor",
      name: "Collaborative Markdown Editor",
      key: "CME",
      status: "Walking skeleton",
      root: {
        id: "folder:project-root",
        kind: "projectRoot",
        name: "Project root",
        children: [
          {
            id: "folder:review-path",
            kind: "regular",
            name: "Review path",
            children: [
              {
                id: "doc:launch-review-plan",
                kind: "document",
                name: "Seeded collaboration document",
                folderId: "folder:review-path",
                status: "Review",
                updatedLabel: "Open for CE review",
                ownerLabel: "Mina",
              },
              {
                id: "doc:markdown-preview-fixture",
                kind: "document",
                name: "Markdown preview fixture",
                folderId: "folder:review-path",
                status: "Saved",
                updatedLabel: "Contains table and code",
                ownerLabel: "Joon",
              },
            ],
          },
          {
            id: "folder:decisions",
            kind: "regular",
            name: "Decisions",
            children: [
              {
                id: "doc:sync-engine-decision",
                kind: "document",
                name: "Sync engine decision",
                folderId: "folder:decisions",
                status: "Saved",
                updatedLabel: "ADR linked",
                ownerLabel: "Mina",
              },
            ],
          },
        ],
      },
    },
  ],
} satisfies NormalizedWorkspaceNavigationViewModel;
