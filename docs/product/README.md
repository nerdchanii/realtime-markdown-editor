---
title: docs/product/README.md
status: active
---

# docs/product/README.md

## 목적

제품 문서는 사용자에게 보이는 product surface와 capability를 설명한다. Architecture track, research task, local setup task, backlog governance를 소유하지 않는다.

## Product Surface

| surface | 목적 | 문서 |
| --- | --- | --- |
| Editor | 과제 핵심 요구와 editor-facing extension. | `docs/product/editor/` |
| Workspace | workspace, user, membership, document context. | `docs/product/workspace/` |
| Workflow | future document-state automation의 기반. | `docs/product/workflow/` |

## Product Surface Map

| capability | surface | 관련 요구사항 | 관련 ADR |
| --- | --- | --- | --- |
| 동시 편집 | Editor | `CE-01-CONCURRENT-EDITING`, `REQ-COLLAB-ENGINE-ADAPTER` | ADR-0001, ADR-0002 |
| Presence | Editor | `CE-02-PRESENCE`, `REQ-PRESENCE-MEMBER-AWARENESS`, `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` | ADR-0001, ADR-0005 |
| Offline merge | Editor | `CE-03-OFFLINE-MERGE`, `REQ-OFFLINE-LOCAL-PERSISTENCE`, `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY` | ADR-0002, ADR-0003 |
| History | Editor | `CE-04-REVISION-HISTORY`, `REQ-HISTORY-CHECKPOINTS`, `REQ-COLLABORATIVE-CREATION-VISIBILITY` | ADR-0003, ADR-0004 |
| Rich preview | Editor | `CE-05-RICH-PREVIEW`, `REQ-EDITOR-RICH-AUTHORING-SURFACE` | ADR-0002, ADR-0005, ADR-0007 |
| Properties | Editor | `REQ-PROPERTIES-OUTSIDE-BODY` | ADR-0005 |
| Links/backlinks | Editor | `REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN` | ADR-0005 |
| Markdown export | Editor | `REQ-MARKDOWN-EXPORT-FRONTMATTER` | ADR-0005 |
| Workspace hierarchy | Workspace | `REQ-WORKSPACE-HIERARCHY`, `REQ-COLLABORATIVE-CREATION-VISIBILITY`, `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` | ADR-0001, ADR-0005 |
| User membership | Workspace | `REQ-IDENTITY-MEMBERSHIP`, `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT` | ADR-0001 |
| DocumentState | Workflow | `REQ-DOCUMENT-STATE-FOUNDATION` | ADR-0004, ADR-0005 |

## 보류된 제품 아이디어

보류 항목은 `docs/requirements/backlog/`의 ID별 파일에 둔다. 단, 이미 domain model foundation으로 선택된 항목은 product surface 문서에서도 설명할 수 있다.
