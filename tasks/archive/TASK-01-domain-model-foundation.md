---
title: TASK-01-domain-model-foundation
status: todo
scope: domain
---

# TASK-01: Domain Model Foundation

## 목표

CE walking skeleton에 필요한 domain model과 Clean Architecture boundary를 문서와 API skeleton에 반영한다.

## 범위

- `Workspace`, `Project`, `Folder`, `Document`, `User`, `WorkspaceMembership`, `Checkpoint`를 domain entity/aggregate로 둔다.
- `DocumentProperty`는 `Document`가 소유한 child/value로 둔다.
- `DocumentState`는 value/state로 둔다.
- `LinkEdge`는 Markdown body에서 파생되는 projection/read model로 둔다.
- `Presence`, `RemoteCursor`, `RemoteSelection`, `AwarenessState`, `SyncStatus`, `CollaborationArtifact`는 domain object로 만들지 않는다.

## 제외

- RBAC enforcement.
- comments, suggestions, mentions, notifications.
- workflow hooks와 workflow builder.
- collaboration provider 선택과 final sync ADR.

## 검증

- domain docs와 ADR-0001이 위 분류를 반영한다.
- `apps/api/src/modules/*/domain`에 Nest decorator나 provider SDK import가 없다.
- 공유 domain/application/shared/utils package가 없다.
