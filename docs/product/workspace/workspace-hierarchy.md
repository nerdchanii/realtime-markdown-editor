---
title: docs/product/workspace/workspace-hierarchy.md
surface: workspace
related_requirements:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-WORKSPACE-DOCUMENT-SCOPE
  - REQ-COLLABORATIVE-CREATION-VISIBILITY
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
related_adrs:
  - ADR-0001
  - ADR-0005
  - ADR-0006
---

# docs/product/workspace/workspace-hierarchy.md

## 의도

제품은 single temporary editor page가 아니라 team workspace처럼 느껴져야 한다. 사용자는 workspace 안에서 project, folder, document를 탐색하지만, domain source of truth는 hidden root folder를 가진 filesystem-like folder tree다.

## 제품 범위

- Workspace root 화면은 workspace-level folder/document와 project entry를 함께 보여줄 수 있다.
- Workspace는 user-visible folder가 아닌 hidden `WorkspaceRootFolder`를 가진다.
- Project는 user-visible folder가 아닌 hidden `ProjectRootFolder`를 가진다.
- Project root에 바로 보이는 document는 domain에서 `ProjectRootFolder` 아래 document다.
- Workspace root에 바로 보이는 document는 domain에서 `WorkspaceRootFolder` 아래 document다.
- Folder는 folder nesting과 folder-to-folder move를 지원한다.
- Folder move는 같은 owner scope 안에서만 허용한다.
- Folder는 자기 자신이나 descendant 아래로 이동할 수 없다.
- Root folder는 move/delete 대상이 아니다.
- Local review를 위해 workspace/project/root-folder/document hierarchy를 seed한다.
- 더 많은 projects, folders, documents로 확장 가능한 model을 유지한다.
- Document 생성 결과는 생성자 view에만 머물지 않고 같은 workspace를 보는 다른 member의 document list에도 표시되어야 한다.
- Workspace, project, folder, document는 제품 UI에서 추가, 수정, 삭제 또는 archive할 수 있어야 한다.
- Folder와 document move는 Explorer의 normal navigation control에서 실행하며, move 후 workspace
  navigation projection에 즉시 반영된다.

## 표시와 정렬

- 기본 정렬 방향과 표시 순서는 navigation/query projection이 정한다.
- Domain entity는 `name`, `kind`, `createdAt`, `updatedAt`, `deletedAt` 같은 정렬 가능한 사실을 제공한다.
- Persisted manual ordering은 별도 요구가 생기기 전까지 도입하지 않는다.

## 보류

- Billing, provisioning, invitation, organization administration은 보류한다.
- Per-folder permission은 보류한다.
- Project-level workflow state와 workflow hooks는 보류한다.
- Multi-workspace administration은 보류한다.
