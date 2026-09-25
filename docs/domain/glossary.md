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
| Document                | 협업 가능한 Markdown file/content 단위. 정확히 하나의 Folder에 속하며 `folderId`를 필수로 가진다.                                   |
| Markdown body           | 사용자가 작성하는 이식 가능한 body content. Internal properties는 제외한다.                                                         |
| Document property       | Markdown body 밖에 저장되는 `Document` 소유 구조화 metadata. 독립 aggregate가 아니다.                                               |
| DocumentState           | `draft`, `review`, `saved` 같은 workflow-facing value/state. 현재 제품에서는 직접 변경할 수 있고 transition policy가 없다.          |
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
| LinkEdge                | Markdown body의 standard link에서 파생되는 document connection projection.                                                          |
| SyncStatus              | offline, reconnecting, pending local edit 같은 application/UI state. `DocumentState`가 아니다.                                      |
| Collaboration artifact  | sync/history에 필요한 provider-specific 또는 serialized document state. Domain entity가 아니라 adapter/infrastructure concern이다.  |
| Object artifact         | relational metadata 밖에 저장되는 blob, snapshot, export, large document artifact.                                                  |
| Adapter                 | provider-specific API를 domain/application code에서 숨기는 경계.                                                                    |
| Feature acceptance path | 제품 기능을 사용자 행동 단위로 확인하는 경로.                                                                                        |
