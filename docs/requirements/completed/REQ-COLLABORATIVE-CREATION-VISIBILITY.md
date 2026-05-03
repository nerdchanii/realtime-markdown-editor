---
id: REQ-COLLABORATIVE-CREATION-VISIBILITY
title: Document와 checkpoint 생성은 다른 활성 workspace member에게도 보여야 한다.
status: done
category: product-extension
type: functional
taskability: done
scope: collaboration
derived_from: REQ-WORKSPACE-HIERARCHY, REQ-HISTORY-CHECKPOINTS
depends_on:
  - REQ-WORKSPACE-HIERARCHY
  - REQ-HISTORY-CHECKPOINTS
blocks: []
completed_by:
  - tasks/archive/TASK-099-collaborative-creation-visibility.md
refs:
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/editor/history.md
  - docs/compliance/feature-acceptance-map.md
  - tasks/archive/TASK-099-collaborative-creation-visibility.md
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

## Completion Evidence

`TASK-099` uses conservative product polling instead of a realtime event bus. Active product
workspace sessions periodically reload workspace navigation, and the active history inspector
periodically reloads checkpoint metadata and snapshots for the current document. This keeps
document and checkpoint creation visible to other active members through product APIs without
touching the editor collaboration adapter.

Evidence:

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-collaborative-creation-visibility.spec.ts`
