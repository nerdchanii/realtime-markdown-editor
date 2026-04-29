---
title: docs/domain/glossary.md
status: active
---

# docs/domain/glossary.md

| 용어 | 의미 |
| --- | --- |
| Workspace | project, folder, document, member를 담는 회사/팀 단위 컨테이너. |
| Project | 관련 folder와 document를 묶는 workspace 단위 묶음. |
| Folder | project 안에서 document를 조직하는 노드. |
| Document | 협업 가능한 Markdown 기반 콘텐츠 단위. |
| Markdown body | 사용자가 작성하는 이식 가능한 body content. Internal properties는 제외한다. |
| Document property | Markdown body 밖에 저장되는 `Document` 소유 구조화 metadata. 독립 aggregate가 아니다. |
| DocumentState | `draft`, `review`, `saved` 같은 workflow-facing value/state. |
| User | 특정 workspace와 독립적인 사람/account identity. |
| WorkspaceMembership | 한 workspace 안에서 user가 갖는 identity. member display name/color를 포함한다. |
| Presence | cursor와 selection을 보여주는 임시 realtime awareness. Domain entity가 아니라 application/provider awareness state다. |
| Checkpoint | metadata를 가진 user-visible historical document state. |
| Autosave | 지속적인 persistence/sync behavior. User-facing checkpoint가 아니다. |
| LinkEdge | Markdown body의 standard link에서 파생되는 document connection projection. |
| SyncStatus | offline, reconnecting, pending local edit 같은 application/UI state. `DocumentState`가 아니다. |
| Collaboration artifact | sync/history에 필요한 provider-specific 또는 serialized document state. Domain entity가 아니라 adapter/infrastructure concern이다. |
| Object artifact | relational metadata 밖에 저장되는 blob, snapshot, export, large document artifact. |
| Adapter | provider-specific API를 domain/application code에서 숨기는 경계. |
| Walking skeleton | CE-01부터 CE-05까지를 깊은 확장 없이 end-to-end로 증명하는 얇은 경로. |
