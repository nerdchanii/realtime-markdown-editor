---
id: REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY
title: Offline 상태에서 작성 중인 문서는 tab/browser 종료 후에도 IndexedDB에서 복구된다.
status: done
category: product-extension
type: functional
priority: high
taskability: taskable
scope: collaboration
derived_from: CE-03-OFFLINE-MERGE
depends_on:
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-OFFLINE-RECONNECT-MERGE
blocks: []
next_step: Browser-local recovery scope를 workspace-wide offline cache로 넓히지 않고 CE-03 evidence로 유지한다.
refs:
  - docs/product/editor/offline-merge.md
  - docs/adr/0003-storage-strategy.md
  - docs/domain/rules/collaboration-boundaries.md
  - docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus/README.md
  - tasks/archive/TASK-084-indexeddb-offline-draft-recovery.md
---

# REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY

Open-page offline merge만으로는 `CE-03`을 제품 수준에서 충분히 지킨다고 볼 수 없다. 사용자가 network
offline 상태에서 문서를 편집한 뒤 브라우저 tab을 닫거나 컴퓨터가 꺼져도, 같은 browser profile에서 다시
열었을 때 작성 중이던 local draft를 복구하고 reconnect 시 server state와 병합해야 한다.

Implementation:

- Product realtime editor의 Tiptap/Yjs adapter가 current member와 document key로 scope 된 Yjs update
  snapshot을 IndexedDB에 저장한다.
- 같은 browser profile에서 다시 열린 document는 browser-local draft를 `Y.Doc`에 적용한 뒤 기존
  Hocuspocus/Yjs reconnect merge path로 remote state와 수렴한다.
- IndexedDB store 이름과 record shape는 adapter 내부 구현이며 product/domain API, server contract,
  shared package boundary로 노출하지 않는다.

Evidence:

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `set -a; source .env; set +a; scripts/with-node.sh pnpm test:e2e -- e2e/ce-03-offline-merge.spec.ts`

Acceptance:

- Alice가 product editor에서 offline 상태로 document를 편집한 뒤 tab 또는 browser context를 닫아도
  같은 browser profile에서 다시 열면 offline edit가 local draft로 복구된다.
- 복구된 local draft는 reconnect 후 online 상태에서 들어온 remote edit와 함께 병합된다.
- IndexedDB는 product/domain API에 노출되지 않고 browser-local persistence adapter 뒤의 구현
  detail로 남는다.
- Local draft 복구 상태는 사용자에게 명확히 표시되어야 하며, server sync 완료 전에도 data-loss
  위험을 숨기지 않는다.
- 다른 workspace document의 전체 offline cache는 이 요구사항의 범위가 아니며
  `REQ-DEFERRED-WORKSPACE-OFFLINE-CACHE`에서 별도로 다룬다.
