---
title: docs/domain/glossary.md
status: active
---

# docs/domain/glossary.md

| 용어                    | 의미                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Workspace               | project, workspace-level folder/document, member를 담는 회사/팀 단위 컨테이너. 정확히 하나의 숨겨진 `WorkspaceRootFolder`를 가진다. |
| Project                 | workspace 안의 grouping entity. 정확히 하나의 숨겨진 `ProjectRootFolder`를 가지며 Folder subtype이 아니다.                          |
| WorkspaceRootFolder     | workspace-level folder tree의 system-owned structural root. user-visible regular folder가 아니며 move/delete 대상이 아니다.         |
| ProjectRootFolder       | project 내부 file tree의 system-owned structural root. user-visible regular folder가 아니며 move/delete 대상이 아니다.              |
| Folder                  | workspace 또는 project owner scope 안에서 document와 하위 folder를 담는 containment node. Document subtype이 아니다.                |
| FolderKind              | `workspaceRoot`, `projectRoot`, `regular`, `inbox`로 folder policy를 구분하는 value.                                                |
| Folder path             | Folder tree에서 파생되는 read-model/projection. source of truth가 아니다.                                                           |
| Document                | 협업 가능한 file/content 단위. 정확히 하나의 Folder에 속하며 `folderId`를 필수로 가진다. (목표, ADR-0013) `type`(`markdown`, `code` 등)을 가진다. 현재 구현은 모두 Markdown 문서다. |
| Markdown body           | `markdown` 타입 문서의 본문. 이식 가능하며 internal properties는 제외한다. 다른 타입의 본문은 type 별 `content` 다(ADR-0013). |
| Document property       | Markdown body 밖에 저장되는 `Document` 소유 구조화 metadata. 독립 aggregate가 아니다.                                               |
| DocumentState           | `draft`, `review`, `saved` 로 고정된 workflow-facing value/state. (목표, ADR-0017) 정본은 범위별 문서 레코드(server 는 DB, local 은 기기 저장소)이고 Y.Doc 밖에 있다. 전환은 `document.state.change` 권한과 workspace 의 전환별 guard 로 판정한다. 현재 구현은 권한 구분 없이 직접 바꾼다. |
| Workflow | (목표, ADR-0017) 상태 전환에 반응해 동작을 실행하는 선언. owner, scope, trigger, actions, 에이전트 모드를 가진다. server 범위에만 있다. |
| ChangeBundle | (목표, ADR-0016) 에이전트 요청 한 번으로 생긴 편집 전체. 제안, 직접 편집, 되돌리기, 이력, audit 의 공통 단위다. checkpoint 와 다른 이력 항목이다. |
| Suggestion | (목표, ADR-0016) 아직 문서에 들어가지 않은 변경 묶음. 사람이 수락하면 반영된다. `content.suggest` 권한으로 만든다. |
| EditMode | (목표, ADR-0016) 에이전트 편집의 확인 강도. 수동, 편집 수락, 자동, 자동+크루즈, 모두 허용 다섯 단계이고 높은 단계가 낮은 단계를 포함한다. 실제 동작은 min(권한, 모드)이고 문서의 허용 최대 모드를 넘지 못한다. |
| WorkflowRun | (목표, ADR-0017) 워크플로우 한 번의 실행 기록. 트리거한 사람, owner, 상태, 인과 정보(root, 깊이)를 가진다. |
| User                    | 특정 workspace와 독립적인 사람/account identity.                                                                                    |
| WorkspaceMembership     | 한 workspace 안에서 user가 갖는 identity. member display name/color를 포함한다.                                                     |
| WorkspaceMembershipRole | (목표, ADR-0012) `owner > admin > editor > viewer`. 현재 구현은 `owner`, `member` 두 가지다. |
| Principal | (목표, ADR-0012) 권한 판정의 주체. `User`, `LocalUser`, `Agent` 가 있다. |
| LocalUser | (목표, ADR-0012) 계정 없이 local 범위를 쓰는 기기 사용자. 로그인하거나 승격할 때 `User` 에 연결된다. |
| Agent | (목표, ADR-0012) AI 에이전트 principal. 사용자의 대리인(delegated)이거나 독립 참여자(member)다. |
| Actor | (목표, ADR-0012) 쓰기를 한 주체의 기록. `{ principal, onBehalfOf? }` 형태다. |
| Grant | (목표, ADR-0012) 자원(문서, folder) 단위로 역할을 더하는 권한 부여. 다음 단계에 구현한다. |
| Authority | (목표, ADR-0011) workspace 의 데이터 권위 범위 `server` 또는 `local`. |
| DocumentType | (목표, ADR-0013) 문서의 편집 대상 종류. `markdown`, `code` 등이 있다. |
| Presence                | cursor와 selection을 보여주는 임시 realtime awareness. Domain entity가 아니라 application/provider awareness state다.               |
| Checkpoint              | metadata를 가진 user-visible historical document state.                                                                             |
| Autosave                | 지속적인 persistence/sync behavior. User-facing checkpoint가 아니다.                                                                |
| LinkEdge                | 문서 본문의 link 에서 파생되는 document connection projection. 추출은 type module 의 `extractLinks` 가 맡는다(목표, ADR-0013). 현재는 Markdown standard link 만 추출한다. |
| SyncStatus              | offline, reconnecting, pending local edit 같은 application/UI state. `DocumentState`가 아니다.                                      |
| Collaboration artifact  | sync/history에 필요한 provider-specific 또는 serialized document state. Domain entity가 아니라 adapter/infrastructure concern이다.  |
| Object artifact         | relational metadata 밖에 저장되는 blob, snapshot, export, large document artifact.                                                  |
| Adapter                 | provider-specific API를 domain/application code에서 숨기는 경계.                                                                    |
| Feature acceptance path | 제품 기능을 사용자 행동 단위로 확인하는 경로.                                                                                        |
