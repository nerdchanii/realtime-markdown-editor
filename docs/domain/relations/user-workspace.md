---
title: docs/domain/relations/user-workspace.md
status: active
---

# docs/domain/relations/user-workspace.md

## 계약

Workspace-specific collaboration identity는 `User`가 아니라 `WorkspaceMembership`에서 나온다.

```mermaid
classDiagram
  User "1" --> "*" WorkspaceMembership
  Workspace "1" --> "*" WorkspaceMembership
  WorkspaceMembership ..> Presence : supplies identity
  WorkspaceMembership --> Checkpoint
```

## 규칙

- Presence label과 color는 membership에서 나온다.
- 가능하면 checkpoint author는 membership을 참조한다.
- Local development에서는 mocked/reviewer identity를 허용하지만 membership boundary를 흉내 내야 한다.
- Authorization은 deferred지만 identity modeling은 deferred가 아니다.
- Presence 자체는 durable domain entity가 아니라 collaboration provider/application awareness state다.
