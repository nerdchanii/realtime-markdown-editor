---
title: docs/domain/README.md
status: active
---

# docs/domain/README.md

## 목적

Domain docs는 구현이 지켜야 할 제품 언어와 계약을 정의한다. Persistence schema가 아니며 code를 대체하지 않는다.

## 읽는 순서

1. `docs/domain/glossary.md`
2. `docs/domain/models/workspace.md`
3. `docs/domain/models/project.md`
4. `docs/domain/models/folder.md`
5. `docs/domain/models/user.md`
5a. `docs/domain/models/principal.md` (목표 모델, ADR-0012)
5b. `docs/domain/models/agent-edit.md` (목표 모델, ADR-0016)
6. `docs/domain/models/document.md`
7. `docs/domain/models/checkpoint.md`
8. `docs/domain/models/document-property.md`
9. `docs/domain/models/document-state.md`
9a. `docs/domain/models/workflow.md` (목표 모델, ADR-0017)
10. `docs/domain/projections/link-edge.md`
11. `docs/domain/relations/user-workspace.md`
12. `docs/domain/relations/workspace-document.md`
13. `docs/domain/rules/document-lifecycle.md`
14. `docs/domain/rules/folder-lifecycle.md`
15. `docs/domain/rules/collaboration-boundaries.md`

## 목표 모델 표시

`(목표, ADR-xxxx)` 가 붙은 항목은 accepted 되었지만 아직 구현되지 않은 모델이다. 현재 코드와 다를 수 있다. 구현이 끝나면 표시를 지운다.

## 변경 규칙

Domain meaning 변경은 민감하다. Entity responsibility, relationship meaning, lifecycle state, provider boundary를 바꾸는 경우 관련 domain doc을 업데이트하고 ADR 필요 여부를 확인한다.

## 모델 분류

| 분류                          | 모델                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| Entity/Aggregate              | `Workspace`, `Project`, `Folder`, `Document`, `User`, `WorkspaceMembership`, `Checkpoint`. 목표 모델에서는 `LocalUser`, `Agent` 가 추가된다(ADR-0012). `Workflow`, `WorkflowRun` 도 추가된다(ADR-0017). 에이전트 편집의 `ChangeBundle`(제안 포함)도 추가된다(ADR-0016). |
| Document-owned child/value    | `DocumentProperty`                                                                                     |
| Value/state                   | `FolderKind`, `DocumentState`, `WorkspaceMembershipRole`. 목표 모델에서는 `EditMode` 가 추가된다(ADR-0016). |
| Derived projection/read model | `LinkEdge`, workspace/project/folder/document navigation projection                                    |
| Domain object 아님            | `Presence`, `RemoteCursor`, `RemoteSelection`, `AwarenessState`, `SyncStatus`, `CollaborationArtifact` |

Presence와 sync 상태는 제품 capability와 application state로 중요하지만 durable domain entity가 아니다. Collaboration provider state와 artifact payload는 adapter/infrastructure 경계 뒤에 둔다. Workspace navigation tree는 read model/projection이며 `Project`를 `Folder` subtype으로 만들지 않는다.

## 다이어그램 정책

Mermaid/UML은 domain contract 보존에 도움이 되는 relationship과 state transition에만 사용한다. 모든 code field를 문서에 중복 기재하지 않는다.
