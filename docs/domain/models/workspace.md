---
title: docs/domain/models/workspace.md
status: active
---

# docs/domain/models/workspace.md

## 계약

`Workspace`는 최상위 team context다. Project, workspace-level folder/document, membership을 scope한다.

`Workspace`는 정확히 하나의 숨겨진 `WorkspaceRootFolder`를 가진다. `WorkspaceRootFolder`는 user-visible regular folder가 아니라 workspace-level folder tree의 구조적 root다.

## 책임

- Collaborative document를 위한 team/company context를 제공한다.
- Membership과 member identity를 scope한다.
- Workspace-level folder/document tree의 root를 제공한다.
- Project를 직접 소유한다.
- Seeded workspace/project/root-folder/document path가 CE-01부터 CE-05까지의 reviewer path가 되게 한다.

## 책임이 아닌 것

- Billing과 provisioning.
- Enterprise identity provider 연동.
- First skeleton의 fine-grained permission policy.
- Project를 Folder처럼 이동하거나 삭제하는 containment behavior.

## 규칙

- Workspace는 정확히 하나의 `workspaceRoot` folder를 가진다.
- Workspace는 Project를 직접 소유한다.
- Project는 `WorkspaceRootFolder`의 child가 아니다.
- Workspace root navigation은 workspace-level folder/document와 project entry를 sibling처럼 보여줄 수 있지만, 이는 query/read-model projection이다.
- `WorkspaceRootFolder`는 move/delete 대상이 아니다.

## 관계 스케치

```mermaid
classDiagram
  Workspace "1" --> "1" Folder : workspaceRoot
  Workspace "1" --> "*" Project : owns
  Workspace "1" --> "*" WorkspaceMembership
  User "1" --> "*" WorkspaceMembership
  Project "1" --> "1" Folder : projectRoot
  Folder "1" --> "*" Folder : contains
  Folder "1" --> "*" Document : contains
```
