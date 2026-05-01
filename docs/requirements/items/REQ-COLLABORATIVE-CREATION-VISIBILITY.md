---
id: REQ-COLLABORATIVE-CREATION-VISIBILITY
title: Document와 checkpoint 생성은 다른 활성 workspace member에게도 보여야 한다.
status: planned
category: product-extension
type: functional
taskability: taskable
scope: collaboration
derived_from: REQ-WORKSPACE-HIERARCHY, REQ-HISTORY-CHECKPOINTS
depends_on:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-HISTORY-CHECKPOINTS
blocks: []
next_step: document list와 checkpoint list의 cross-user propagation 방식을 refetch, polling, realtime event 중에서 정하고 product e2e로 검증한다.
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/editor/history.md
  - docs/compliance/subject-matrix.md
---

# REQ-COLLABORATIVE-CREATION-VISIBILITY

Document나 checkpoint 생성 결과는 생성자 client의 local state에만 머물면 안 된다.
같은 workspace document context를 보는 다른 활성 member도 normal product path에서 생성된
document와 checkpoint를 볼 수 있어야 한다.

Acceptance:

- Alice가 workspace에서 document를 만들면 Bob의 workspace document list에도 product state
  propagation을 통해 표시된다.
- Alice가 checkpoint를 만들면 Bob의 history list에도 같은 checkpoint metadata와 inspectable
  snapshot entry가 표시된다.
- 이 동작은 dev seed route, URL spoofing, creator-only React state에 의존하지 않는다.
