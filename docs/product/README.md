---
title: docs/product/README.md
status: active
---

# docs/product/README.md

## 목적

제품 문서는 사용자에게 보이는 기능과 사용 흐름을 설명한다. 문서의 기준은 내부 추적 항목이나 완료 gate가
아니라, 팀이 워크스페이스 안에서 Markdown 문서를 함께 작성하고 유지하는 실제 사용 경험이다.

각 기능 문서는 사용자가 무엇을 할 수 있는지, 어떤 상태를 이해할 수 있는지, 다른 기능과 어떻게
연결되는지를 설명한다. Architecture track, research task, local setup task, backlog governance는 이
문서의 소유 범위가 아니다.

## Product Areas

| area      | 목적                                           | 문서                       |
| --------- | ---------------------------------------------- | -------------------------- |
| Editor    | Markdown 작성, 협업 편집, presence, 이력 관리. | `docs/product/editor/`     |
| Workspace | workspace, user, membership, document context. | `docs/product/workspace/`  |
| Workflow  | document state와 향후 문서 자동화의 기반.      | `docs/product/workflow/`   |

## Feature Map

| capability              | surface       | 관련 요구사항                                                                                            | 관련 ADR                     |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Editor-first UI refresh | Product shell | `REQ-EDITOR-FIRST-UI-REFRESH`                                                                            | DESIGN.md                    |
| 동시 편집               | Editor        | `REQ-COLLAB-ENGINE-ADAPTER`                                                                              | ADR-0001, ADR-0002           |
| Presence                | Editor        | `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`                                  | ADR-0001, ADR-0005           |
| Offline merge           | Editor        | `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY`                                  | ADR-0002, ADR-0003           |
| History                 | Editor        | `REQ-HISTORY-CHECKPOINTS`, `REQ-COLLABORATIVE-CREATION-VISIBILITY`                                       | ADR-0003, ADR-0004           |
| Rich preview            | Editor        | `REQ-EDITOR-RICH-AUTHORING-SURFACE`                                                                      | ADR-0002, ADR-0005, ADR-0007 |
| Properties              | Editor        | `REQ-PROPERTIES-OUTSIDE-BODY`                                                                            | ADR-0005                     |
| Links/backlinks         | Editor        | `REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN`                                                                  | ADR-0005                     |
| Markdown export         | Editor        | `REQ-MARKDOWN-EXPORT-FRONTMATTER`                                                                        | ADR-0005                     |
| Workspace hierarchy     | Workspace     | `REQ-WORKSPACE-HIERARCHY`, `REQ-COLLABORATIVE-CREATION-VISIBILITY`, `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` | ADR-0001, ADR-0005           |
| User membership         | Workspace     | `REQ-IDENTITY-MEMBERSHIP`, `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`        | ADR-0001, ADR-0008           |
| DocumentState           | Workflow      | `REQ-DOCUMENT-STATE-FOUNDATION`                                                                          | ADR-0004, ADR-0005           |

## 보류된 제품 아이디어

보류 항목은 `docs/archive/requirements/backlog/`의 ID별 파일에 둔다. 단, 이미 domain model foundation으로 선택된 항목은 product surface 문서에서도 설명할 수 있다.
