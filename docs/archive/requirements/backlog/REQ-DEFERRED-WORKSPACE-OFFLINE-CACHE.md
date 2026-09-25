---
id: REQ-DEFERRED-WORKSPACE-OFFLINE-CACHE
title: 열린 문서가 아닌 전체 workspace 범위의 offline cache를 제공한다.
status: deferred
category: backlog
type: functional
taskability: blocked
scope: platform
derived_from: CE-03-OFFLINE-MERGE
depends_on:
  - CE-03-OFFLINE-MERGE
  - REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY
blocks: []
next_step: 현재 document IndexedDB draft recovery가 구현된 뒤 workspace-wide prefetch/cache 범위와 비용을 재평가한다.
refs:
  - docs/product/editor/offline-merge.md
---

# REQ-DEFERRED-WORKSPACE-OFFLINE-CACHE

CE-03의 product bar는 현재 작성 중인 document의 tab/browser 종료 후 복구까지 포함하도록 강화했다.
그 범위는 `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY`가 담당한다. 이 항목은 열린 문서를 넘어 workspace
전체 prefetch/cache를 제공하는 별도 제품 범위다.
