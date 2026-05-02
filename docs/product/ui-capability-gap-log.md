---
title: UI Capability Gap Log
status: active
---

# UI Capability Gap Log

이 문서는 UI가 먼저 노출하지만 backend/API/domain 기능이 아직 따라오지 않은 제품 gap을 추적한다.
`DESIGN.md` 기반 UI refresh는 editor-first 제품 구조를 먼저 세울 수 있지만, 기능이 없는 UI가 완료된
기능처럼 보이면 안 된다.

## 기록 규칙

- UI placeholder는 사용자가 기능 미완성 상태를 알 수 있어야 한다.
- Placeholder는 실제 저장, 권한 변경, 초대, 삭제, billing, audit 같은 부작용을 수행하는 것처럼 보이면 안 된다.
- UI 작업자가 backend/API/domain gap을 발견하면 server code를 수정하지 않고 이 문서에 기록한다.
- 각 gap은 owner requirement 또는 follow-up task 후보를 함께 적는다.
- gap이 구현되면 related task/archive evidence를 남기고 항목을 닫는다.

## Gap Items

| ID         | Surface                    | Placeholder behavior                                                                                                             | Missing capability                                                                                 | Follow-up owner                                                           | Status |
| ---------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| UI-GAP-001 | Profile menu / settings    | Profile menu opens scoped User, Workspace, and Project settings with persisted account/workspace/project/member/lifecycle edits. | Completed by `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` and `REQ-EDITOR-FIRST-UI-REFRESH`.               | `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`, `REQ-EDITOR-FIRST-UI-REFRESH`       | closed |
| UI-GAP-002 | Workspace/member controls  | Workspace settings lists members and supports add, role change, and removal through product APIs.                                | Completed by `REQ-WORKSPACE-MEMBER-MANAGEMENT`.                                                    | `REQ-WORKSPACE-MEMBER-MANAGEMENT`                                         | closed |
| UI-GAP-003 | Publish flow               | Publish button exists in toolbar but does nothing or shows placeholder.                                                          | Publish/review workflow implementation for transitioning drafts to published state.                | `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`                                      | open   |
| UI-GAP-004 | Search / Command palette   | Search input box has placeholder and keyboard shortcut hint.                                                                     | Full text search and command execution layer across workspace documents.                           | Pending `REQ-WORKSPACE-SEARCH`                                            | open   |
| UI-GAP-005 | Backlinks tab              | History inspector shows Backlinks tab with count but no active list.                                                             | Linking and backlink indexing, retrieving referenced files from graph.                             | Pending `REQ-DOCUMENT-BACKLINKS`                                          | open   |
| UI-GAP-006 | Favorites                  | Left sidebar shows Favorites section with hardcoded mock items.                                                                  | Ability to star/favorite documents and persist this preference per user.                           | Pending `REQ-USER-PREFERENCES`                                            | open   |
| UI-GAP-007 | Direct Messages            | Left sidebar shows Direct Messages section with mock users.                                                                      | Real-time chat, presence, and direct message channels between workspace members.                   | Pending `REQ-DIRECT-MESSAGING`                                            | open   |
| UI-GAP-008 | Trash                      | Left sidebar Trash panel lists archived documents and restores them through product APIs.                                        | Completed by `TASK-096`.                                                                           | `REQ-DOCUMENT-TRASH-RESTORE`                                              | closed |
| UI-GAP-009 | Explorer File Search       | Explorer has "Search files..." input with placeholder behavior.                                                                  | Local or server-side filtering of the workspace tree navigation.                                   | Pending `REQ-WORKSPACE-SEARCH`                                            | open   |
| UI-GAP-010 | Document properties header | Document header renders hardcoded status, assignee, tags, and due date.                                                          | Render document properties from product API data and support property mutations.                   | `REQ-PROPERTIES-OUTSIDE-BODY`, pending property mutation follow-up        | open   |
| UI-GAP-011 | Top bar workspace context  | Top bar reads current workspace/project labels from the product workspace model, without switcher controls.                      | Workspace/project switcher data and scoped navigation.                                             | `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`   | open   |
| UI-GAP-012 | Markdown export action     | Export action calls the mock API client and seed document fallbacks.                                                             | Wire export to the active product API client and selected product document id.                     | `REQ-MARKDOWN-EXPORT-FRONTMATTER`, frontend product API follow-up         | open   |
| UI-GAP-013 | Editor mock collaboration  | Editor slot can fall back to localStorage/BroadcastChannel mock sync.                                                            | Remove mock collaboration runtime from product UI paths and fail closed when absent.               | `REQ-COLLAB-ENGINE-ADAPTER`, `REQ-PRESENCE-MEMBER-AWARENESS`              | open   |
| UI-GAP-014 | History mock fallback      | History state can use mock client, seed ids, and fallback Sarah entries.                                                         | Product history must only show persisted checkpoint/autosave data from server APIs.                | `REQ-HISTORY-CHECKPOINTS`, `REQ-HISTORY-AUTOSAVE-SEPARATION`              | open   |
| UI-GAP-015 | Seed review context path   | App still contains seed review context and mock app provider entrypoints.                                                        | Remove demo provider paths from product UI runtime or isolate them behind dev tooling.             | `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`, `REQ-CE-ACCEPTANCE-TEST-DECOUPLING`    | open   |
| UI-GAP-016 | Workspace seed fallback    | Workspace normalization can silently fill missing data from seeded nav.                                                          | Product navigation should render only API data, explicit empty states, or real errors.             | `REQ-WORKSPACE-HIERARCHY`, frontend product API follow-up                 | open   |
| UI-GAP-017 | Auth seed account UI       | Primary auth copy is product-shaped; development builds still expose labeled local seed account shortcuts.                       | Account creation/profile completed by `TASK-101` and `TASK-102`; seed shortcuts remain dev-scoped. | `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`    | closed |
| UI-GAP-018 | Document create defaults   | New documents are created with frontend-authored "Start writing here" body.                                                      | Server-backed template/default content policy or empty-document creation contract.                 | `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`, pending document template follow-up | open   |
| UI-GAP-019 | Profile menu notifications | Profile menu shows a disabled Notifications item.                                                                                | Notification preferences and delivery are deferred.                                                | Pending notification requirement                                          | open   |
| UI-GAP-020 | Keyboard shortcuts         | Profile menu shows a disabled Keyboard shortcuts item.                                                                           | Shortcut reference and customization surface are deferred.                                         | Pending editor preferences requirement                                    | open   |
