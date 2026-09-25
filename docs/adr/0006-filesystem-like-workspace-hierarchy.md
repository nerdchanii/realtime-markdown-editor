---
id: ADR-0006
title: "ADR-0006: Workspace hierarchy는 filesystem-like folder tree로 모델링한다"
status: accepted
date: 2026-04-29
authors:
  - nerdchanii
decision_type: domain-model
tags:
  - workspace
  - folder
  - hierarchy
  - lifecycle
  - markdown-portability
related_requirements:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-MARKDOWN-PORTABILITY
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
  - REQ-PLATFORM-PORTABILITY-GUARDRAIL
related_documents:
  - subject.md
  - docs/archive/requirements/registry.md
  - docs/domain/README.md
  - docs/domain/glossary.md
  - docs/domain/models/workspace.md
  - docs/domain/models/document.md
  - docs/domain/relations/workspace-document.md
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/editor/markdown-export.md
  - docs/product/editor/links-backlinks.md
supersedes: []
superseded_by: null
---

# ADR-0006: Workspace hierarchy는 filesystem-like folder tree로 모델링한다

## 맥락

기존 요구사항과 제품 문서는 `Workspace > Project > Folder > Document`를 첫 hierarchy 언어로 사용했다. 이 표현은 사용자가 anonymous scratch editor가 아니라 workspace context 안의 document를 편집한다는 의도를 잘 보존한다.

그러나 제품 모델을 strict chain으로 고정하면 다음 문제가 생긴다.

- Project 바로 아래 document를 표현하려면 `Document.folderId`가 optional이 되거나 별도 location union이 필요하다.
- Workspace root에 아직 project로 묶이지 않은 folder/document를 둘 수 없다.
- Markdown document를 filesystem directory/file 구조로 import/export하거나 migration하는 경로가 어색해진다.
- Folder nesting, folder move, soft delete/restore/hard delete 같은 파일시스템에 가까운 동작을 나중에 붙일 때 hierarchy 규칙이 흔들린다.

제품은 Markdown portability와 workspace navigation을 모두 중요하게 다룬다. 따라서 domain hierarchy는 UI에서 보이는 project/folder/document 언어를 유지하되, 내부 관계는 filesystem-like folder tree로 정리한다.

이 ADR은 workspace hierarchy와 folder lifecycle을 결정한다. API source layout, Nest module 경계, dependency-cruiser rule은 별도 아키텍처 결정에서 다룬다.

## 결정

Workspace는 최상위 team context이며 정확히 하나의 숨겨진 `WorkspaceRootFolder`를 가진다. `WorkspaceRootFolder`는 user-visible regular folder가 아니라 workspace-level folder tree의 구조적 root다.

Project는 workspace 안의 grouping entity이며 정확히 하나의 숨겨진 `ProjectRootFolder`를 가진다. `ProjectRootFolder`는 user-visible regular folder가 아니라 project tree의 구조적 root다.

Folder는 containment node이며 Document subtype이 아니다. Folder는 정확히 하나의 owner scope를 가진다. `workspaceRoot` folder는 Workspace에 anchor되고, `projectRoot` folder는 Project에 anchor된다. `regular`와 `inbox` folder는 같은 owner scope 안의 root/regular/inbox folder 아래에 놓인다.

Folder는 다음 kind를 가진다.

- `workspaceRoot`: workspace의 구조적 root folder.
- `projectRoot`: project의 구조적 root folder.
- `regular`: 사용자가 문서와 하위 folder를 조직하는 일반 folder.
- `inbox`: 빠른 생성, import, 복구처럼 아직 명시적으로 정리되지 않은 문서를 담기 위한 system folder role.

Document는 Markdown file에 해당한다. 모든 Document는 정확히 하나의 Folder에 속하며 `folderId`를 필수로 가진다. UI가 document를 workspace root나 project root에 있는 것처럼 보여주더라도 domain에서는 각각 `workspaceRoot` 또는 `projectRoot` folder 아래의 document로 표현한다.

Workspace는 Project를 직접 소유한다. Project는 `WorkspaceRootFolder`의 child가 아니며, `parentFolderId`를 갖지 않고, folder move 대상도 아니다. UI navigation은 workspace-level folder/document와 project entry를 같은 root 화면에 sibling처럼 보여줄 수 있지만, 이는 query/read-model projection이다.

Workspace-level document는 `WorkspaceRootFolder` 또는 그 아래 regular/inbox folder에 속한다. Project-level document는 해당 Project가 소유한 `ProjectRootFolder` 또는 그 아래 regular/inbox folder에 속한다. Project가 가진 `ProjectRootFolder`는 project 내부 file tree의 root이며, Project 자체를 Folder subtype으로 만들지 않는다.

Root folder는 system-owned structural node다.

- `workspaceRoot`와 `projectRoot` folder는 이동할 수 없다.
- `workspaceRoot`와 `projectRoot` folder는 soft delete 또는 hard delete 대상이 아니다.
- root folder 이름은 user-visible folder name이 아니라 workspace/project 표시 이름에서 파생된다.

Regular/inbox folder는 nesting을 지원한다.

- Folder는 자기 자신이나 descendant 아래로 이동할 수 없다.
- Folder move는 folder identity와 contained document identity를 바꾸지 않는 location metadata 변경이다.
- Folder path는 source of truth가 아니라 folder tree에서 파생되는 projection이다.

Folder와 Document는 soft delete를 지원한다. Soft-deleted regular/inbox folder는 contained descendants를 navigation과 lifecycle view에서 함께 숨긴다. Folder restore는 같은 subtree를 복구하되, 같은 parent scope 안의 이름/path conflict가 있으면 restore use case가 conflict를 먼저 해결해야 한다.

Hard delete는 soft delete 이후 30일 retention window가 지난 뒤 가능하다. Regular/inbox folder hard delete는 해당 folder subtree의 regular/inbox descendant와 contained document에 cascade된다. Document hard delete는 document metadata, properties, checkpoint metadata, derived link projection을 더 이상 product에서 조회할 수 없게 제거하고, 관련 object artifact 삭제는 storage adapter의 cleanup job으로 예약한다. Root folder는 soft delete와 hard delete 대상이 아니다.

정렬 방향과 기본 표시 순서는 entity invariant가 아니다. Domain은 `name`, `kind`, `createdAt`, `updatedAt`, `deletedAt` 같은 정렬 가능한 사실을 제공하고, navigation/query projection이 이를 기준으로 표시 순서를 정한다. 사용자가 직접 drag/drop으로 고정하는 persisted manual ordering은 별도 요구가 생기기 전까지 도입하지 않는다.

## 후보안

### 1. Filesystem-like folder tree와 숨겨진 root folder

- 장점: 모든 Document가 Folder 아래에 있어 optional parent 문제가 사라진다.
- 장점: Markdown document를 file, Folder를 directory로 볼 수 있어 import/export/migration 경로가 자연스럽다.
- 장점: Workspace root와 Project root를 모두 표현하면서도 Project와 Folder를 섞지 않는다.
- 장점: Folder nesting, move, soft delete/restore/hard delete를 domain rule로 설명하기 쉽다.
- 단점: 기존 `Workspace > Project > Folder > Document` 문서를 수정해야 한다.
- 리스크: root folder가 user-visible folder로 오해되지 않도록 product/domain 문서와 UI projection을 분리해야 한다.

### 2. Strict `Workspace > Project > Folder > Document` chain 유지

- 장점: 기존 문서와 가장 가깝고 first skeleton seed path가 단순하다.
- 단점: Project root document와 Workspace root document를 표현하기 어렵다.
- 단점: `Document.folderId` optional 또는 별도 location model이 필요하다.
- 리스크: filesystem-like import/export와 folder lifecycle을 추가할 때 domain rule을 다시 바꿔야 한다.

### 3. Folder를 Document/Page subtype으로 통합

- 장점: 모든 node를 하나의 tree node로 다룰 수 있다.
- 단점: Folder와 collaborative Markdown Document의 책임이 섞인다.
- 단점: Folder에 Markdown body, checkpoint, rich preview가 있는지 애매해진다.
- 리스크: CE-01부터 CE-05까지의 collaborative Markdown document path와 navigation container가 섞여 평가 경로가 흐려진다.

### 4. Root 위치를 nullable parent로 표현

- 장점: 구현이 단순하고 별도 root folder를 만들지 않아도 된다.
- 단점: root 위치와 folder 위치를 매번 null check로 구분해야 한다.
- 단점: Project root와 Workspace root를 같은 방식으로 표현하기 어렵다.
- 리스크: path, import/export, move validation에서 null parent가 특별 규칙으로 퍼진다.

## 선택 근거

선택한 방식은 Markdown document를 file로, Folder를 directory로 분리한다. 이는 standard Markdown portability, filesystem migration 가능성, project/workspace navigation을 동시에 보존한다.

`Workspace > Project > Folder > Document`는 user-facing navigation 언어로 유지할 수 있지만, domain source of truth는 `WorkspaceRootFolder`와 `ProjectRootFolder`를 가진 folder tree다. 이 차이를 두면 project root에 바로 보이는 document도 domain에서는 `ProjectRootFolder` 아래의 document로 표현된다.

Root folder를 실제 domain entity로 두면 folder move, soft delete, restore, hard delete 규칙을 모든 document에 동일하게 적용할 수 있다. 동시에 root folder는 `FolderKind`와 policy로 제한하므로 subclass hierarchy나 folder-as-document 모델을 만들 필요가 없다.

Project를 folder tree child로 넣지 않고 Workspace-owned grouping entity로 유지하면 project rename/archive 같은 product behavior와 folder move/delete behavior를 분리할 수 있다. Navigation에서 project가 workspace root 아래에 보이는 것은 source of truth가 아니라 projection이다.

## 결과

### 긍정적 영향

- 모든 Document가 `folderId`를 필수로 가지므로 parent model이 단순해진다.
- Workspace root와 Project root를 모두 표현할 수 있다.
- Project, Folder, Document의 책임이 분리된다.
- Folder nesting과 move validation을 명시적으로 다룰 수 있다.
- Markdown import/export와 filesystem-style migration 가능성이 높아진다.
- CE walking skeleton은 여전히 seeded workspace/project/root-folder/document path로 검증할 수 있다.

### 부정적 영향 또는 트레이드오프

- 기존 requirement/product/domain 문서의 strict hierarchy 표현을 업데이트해야 한다.
- Root folder가 user-visible folder가 아니라 structural node라는 설명이 필요하다.
- Folder hard delete cascade는 metadata, read model, object artifact cleanup을 함께 조율해야 하므로 구현 난도가 올라간다.
- Navigation projection이 project, folder, document를 어떻게 묶어 보여줄지 별도 query/read model이 필요하다.

### 후속 작업

- `REQ-WORKSPACE-HIERARCHY`를 strict chain에서 filesystem-like folder tree로 수정한다.
- `REQ-WORKSPACE-DOCUMENT-SCOPE`의 acceptance를 anonymous scratch가 아닌 workspace-scoped document 검증으로 재정리한다.
- `docs/domain/glossary.md`에서 Folder 의미를 project-only node가 아니라 workspace folder tree의 containment node로 수정한다.
- `docs/domain/models/project.md`를 추가하고 Project가 Workspace-owned grouping entity이며 정확히 하나의 `ProjectRootFolder`를 가진다는 계약을 문서화한다.
- `docs/domain/models/folder.md`를 추가한다.
- `docs/domain/models/workspace.md`, `docs/domain/models/document.md`, `docs/domain/relations/workspace-document.md`의 관계 설명과 diagram을 갱신한다.
- `docs/product/workspace/workspace-hierarchy.md`에서 user-facing navigation과 hidden root folder를 분리해 설명한다.
- Folder lifecycle, restore conflict handling, 30일 hard delete cascade 규칙을 `docs/domain/rules/`에 문서화한다.
- 구현 시 hard delete cleanup job이 RDB metadata, read-model projection, object artifact를 일관되게 처리하는지 검증한다.

## 검증 방법

- Domain docs에서 모든 Document가 Folder 아래에 있다는 invariant가 명시되어 있는지 확인한다.
- Workspace와 Project가 각각 root folder를 가진다는 관계가 diagram과 glossary에 반영되어 있는지 확인한다.
- `Workspace > Project > Folder > Document`가 strict storage hierarchy가 아니라 user-facing navigation 표현으로 정리되어 있는지 확인한다.
- Root folder가 move/delete 대상이 아님을 domain rule로 검증할 수 있는지 확인한다.
- Folder와 Document가 subclass 관계나 동일 entity로 합쳐지지 않았는지 확인한다.
- 협업 편집, presence, history, rich authoring path가 seeded workspace/project/root-folder/document에서 계속 설명되는지 확인한다.
- Markdown export가 folder/project metadata를 Markdown body에 섞지 않고, standard Markdown body와 frontmatter policy를 유지하는지 확인한다.
- 구현 후 seeded workspace/project/root-folder/document fixture에서 모든 Document가 non-null `folderId`를 가지는지 테스트한다.
- 구현 후 root folder move/delete, folder를 자기 descendant 아래로 이동, Project를 folder처럼 이동하는 요청이 거부되는지 테스트한다.
- 구현 후 soft-deleted folder subtree가 navigation/lifecycle query에서 숨겨지고 restore conflict가 명시적으로 처리되는지 테스트한다.
- 구현 후 30일 retention이 지난 folder hard delete가 descendant document, checkpoint metadata, link projection cleanup과 object artifact deletion scheduling을 일관되게 수행하는지 테스트한다.

## 관련 문서

- 요구사항: `docs/archive/requirements/registry.md`
- 제품 문서: `docs/product/workspace/workspace-hierarchy.md`
- 도메인 문서: `docs/domain/glossary.md`, `docs/domain/models/workspace.md`, `docs/domain/models/document.md`, `docs/domain/relations/workspace-document.md`
- 관련 ADR: ADR-0001, ADR-0005

## 변경 이력

| 날짜       | 변경 내용                               | 결정자     |
| ---------- | --------------------------------------- | ---------- |
| 2026-04-29 | 최초 작성                               | nerdchanii |
| 2026-04-29 | 최종 리뷰 후 accepted decision으로 확정 | nerdchanii |
