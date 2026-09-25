---
title: TASK-099-collaborative-creation-visibility
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-088
write_set:
  - apps/web/src/app/product-workspace-providers.ts
  - apps/web/src/features/history/useHistoryInspectorState.ts
  - e2e/product-collaborative-creation-visibility.spec.ts
  - docs/requirements/completed/REQ-COLLABORATIVE-CREATION-VISIBILITY.md
  - docs/requirements/items/REQ-COLLABORATIVE-CREATION-VISIBILITY.md
  - docs/requirements/registry.md
  - tasks/archive/TASK-099-collaborative-creation-visibility.md
forbidden_paths:
  - .note/**
  - apps/web/src/features/editor/adapters/**
related_requirements:
  - REQ-COLLABORATIVE-CREATION-VISIBILITY
  - REQ-WORKSPACE-HIERARCHY
  - REQ-HISTORY-CHECKPOINTS
review_required: true
---

# TASK-099: Collaborative Creation Visibility

## Goal

Make document and checkpoint creation visible to another active workspace member without relying on
creator-only React state, dev seed routes, or URL member spoofing.

## Scope

- Added product workspace polling so navigation reloads while a session is open.
- Added product checkpoint polling so the active history inspector reloads checkpoint metadata and
  inspectable snapshots.
- Added a two-member product e2e for Alice-created checkpoint and document visibility in Bob's
  active session.

## Propagation Strategy

This task chooses polling as the first product strategy. A full realtime event bus remains outside
this slice and can be reconsidered if product latency, scale, or infrastructure requirements demand
it.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-collaborative-creation-visibility.spec.ts`
- `scripts/with-node.sh pnpm requirements:index`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
