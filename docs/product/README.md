---
title: docs/product/README.md
status: active
---

# docs/product/README.md

## 목적

제품 문서는 사용자에게 보이는 product surface와 capability를 설명한다. Architecture track, research task, local setup task, backlog governance를 소유하지 않는다.

제품 문서는 `subject.md`의 CE 요구사항을 product story로 해석하고, 세부 REQ가 그 story를 제품으로
성립시키는 방식을 설명한다. 각 CE story는 관련 세부 요구사항과
`docs/product/product-quality-gates.md`의 품질 gate를 함께 통과할 때 완료된다.

## Product Quality 기준

- 제품은 테스트 통과용 demo가 아니라 사용자가 신뢰할 수 있는 협업 Markdown 도구다.
- 인증, 권한, workspace membership, 데이터 보존, 로컬 실행 안정성, UI 일관성은 CE stories를 실제
  제품으로 성립시키는 세부 요구사항이다.
- CE 요구사항은 사용자 행동 단위의 product stories이며, PM적 요구사항 해석과 제품 품질을 낮추는
  명분이 될 수 없다.
- 기능별 product surface 문서는 해당 기능이 어떤 사용자 문제를 해결하고 어떤 품질 gate를 통과해야
  하는지 설명해야 한다.

## Product Surface

| surface         | 목적                                            | 문서                                    |
| --------------- | ----------------------------------------------- | --------------------------------------- |
| Editor          | 과제 핵심 요구와 editor-facing capability.      | `docs/product/editor/`                  |
| Workspace       | workspace, user, membership, document context.  | `docs/product/workspace/`               |
| Workflow        | future document-state automation의 기반.        | `docs/product/workflow/`                |
| Product Quality | 모든 product surface가 통과해야 하는 완료 gate. | `docs/product/product-quality-gates.md` |

## Product Surface Map

| capability              | surface       | 관련 요구사항                                                                                            | 관련 ADR                     |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Editor-first UI refresh | Product shell | `REQ-EDITOR-FIRST-UI-REFRESH`                                                                            | DESIGN.md                    |
| 동시 편집               | Editor        | `CE-01-CONCURRENT-EDITING`, `REQ-COLLAB-ENGINE-ADAPTER`                                                  | ADR-0001, ADR-0002           |
| Presence                | Editor        | `CE-02-PRESENCE`, `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`                 | ADR-0001, ADR-0005           |
| Offline merge           | Editor        | `CE-03-OFFLINE-MERGE`, `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY`           | ADR-0002, ADR-0003           |
| History                 | Editor        | `CE-04-REVISION-HISTORY`, `REQ-HISTORY-CHECKPOINTS`, `REQ-COLLABORATIVE-CREATION-VISIBILITY`             | ADR-0003, ADR-0004           |
| Rich preview            | Editor        | `CE-05-RICH-PREVIEW`, `REQ-EDITOR-RICH-AUTHORING-SURFACE`                                                | ADR-0002, ADR-0005, ADR-0007 |
| Properties              | Editor        | `REQ-PROPERTIES-OUTSIDE-BODY`                                                                            | ADR-0005                     |
| Links/backlinks         | Editor        | `REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN`                                                                  | ADR-0005                     |
| Markdown export         | Editor        | `REQ-MARKDOWN-EXPORT-FRONTMATTER`                                                                        | ADR-0005                     |
| Workspace hierarchy     | Workspace     | `REQ-WORKSPACE-HIERARCHY`, `REQ-COLLABORATIVE-CREATION-VISIBILITY`, `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` | ADR-0001, ADR-0005           |
| User membership         | Workspace     | `REQ-IDENTITY-MEMBERSHIP`, `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`        | ADR-0001, ADR-0008           |
| DocumentState           | Workflow      | `REQ-DOCUMENT-STATE-FOUNDATION`                                                                          | ADR-0004, ADR-0005           |

## 보류된 제품 아이디어

보류 항목은 `docs/requirements/backlog/`의 ID별 파일에 둔다. 단, 이미 domain model foundation으로 선택된 항목은 product surface 문서에서도 설명할 수 있다.
