---
id: REQ-DEFERRED-PRODUCTION-WORKSPACE-FOLDER-CRUD
title: Advanced workspace/folder production administration을 완성한다.
status: ambiguous
category: backlog
type: functional
taskability: ambiguous
scope: backend
derived_from: REQ-WORKSPACE-HIERARCHY
depends_on:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
blocks: []
superseded_by:
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
next_step: 기본 workspace lifecycle UI/API가 구현된 뒤 admin readiness, audit, retention, multi-workspace administration 범위를 분리한다.
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - apps/api/src/modules/workspace/interfaces/workspace-product.controller.ts
  - apps/api/src/modules/documents/interfaces/documents-product.controller.ts
---

# REQ-DEFERRED-PRODUCTION-WORKSPACE-FOLDER-CRUD

기본 workspace/project/folder/document lifecycle은 `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`로 승격했다.
이 backlog 항목은 audit, retention, admin readiness, multi-workspace administration처럼 기본 lifecycle
이후의 production administration 범위만 추적한다.
