---
id: REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
title: Workspace와 하위 project/folder/document lifecycle을 제품 UI에서 추가, 수정, 삭제할 수 있어야 한다.
status: planned
category: product-foundation
type: functional
priority: high
taskability: taskable
scope: workspace
derived_from: REQ-WORKSPACE-HIERARCHY
depends_on:
  - REQ-WORKSPACE-HIERARCHY
blocks: []
next_step: 현재 product API의 create/update/delete coverage를 UI flow와 대조하고, workspace/project/folder/document별 누락된 lifecycle action을 task로 나눈다.
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - packages/contracts/src/http/routes.ts
  - tasks/archive/TASK-075-workspace-folder-document-product-apis.md
---

# REQ-WORKSPACE-LIFECYCLE-MANAGEMENT

Workspace hierarchy는 탐색만 가능하면 부족하다. 사용자는 normal product UI에서 workspace,
project, folder, document를 만들고 이름/metadata를 수정하고 삭제 또는 archive할 수 있어야 한다.

이 요구사항은 협업 문서 product story를 실제 사용자에게 성립시키는 세부 제품 요구사항이다. 사용자가
문서를 만들고, 찾고, 상태를 이해하고, 삭제/보존 정책을 신뢰할 수 있어야 협업 editor path가 제품으로
성립한다.

Acceptance:

- Workspace 생성, 이름/metadata 수정, 삭제 또는 archive 정책이 product UI와 API에서 일관되게 제공된다.
- Project, folder, document의 create/update/move/delete flow가 workspace navigation과 연결된다.
- Root folder처럼 삭제하면 안 되는 structural node는 UI와 API 양쪽에서 보호된다.
- 삭제 또는 archive 같은 destructive action은 사용자가 의도적으로 확인해야 한다.
- 생성, 수정, 삭제 결과는 creator-only local state가 아니라 product state로 반영된다.
