---
title: TASK-098-workspace-project-lifecycle-settings
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-075
  - TASK-094
write_set:
  - apps/web/src/app/TopBar.tsx
  - apps/web/src/app/product-workspace-providers.ts
  - apps/web/src/app/product-workspace-types.ts
  - apps/web/src/features/workspace/index.tsx
  - apps/web/src/lib/api-client/index.ts
  - apps/web/src/styles/global.css
  - e2e/product-workspace-lifecycle.spec.ts
  - docs/requirements/items/REQ-WORKSPACE-LIFECYCLE-MANAGEMENT.md
  - tasks/archive/TASK-098-workspace-project-lifecycle-settings.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
review_required: true
---

# TASK-098: Workspace/Project Lifecycle Settings

## Goal

Expose already-available workspace/project lifecycle API coverage in the normal product UI.

## Scope

- Added product API client helpers for workspace create/update and project create/update routes.
- Enabled workspace rename and project creation from Workspace settings.
- Enabled active project rename from Project settings.
- Made project groups visible in Explorer so created/renamed projects have a product surface.
- Added a product e2e covering workspace rename, project creation, and project rename.

## Remaining Requirement Scope

`REQ-WORKSPACE-LIFECYCLE-MANAGEMENT` remains open. Workspace creation from no-workspace state,
workspace delete/archive policy, project delete/archive policy, folder/document move UI, and full lifecycle
acceptance coverage still need follow-up tasks.

## Verification

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `scripts/with-node.sh pnpm --filter @rme/web test`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/product-workspace-lifecycle.spec.ts`
- `scripts/with-node.sh pnpm requirements:index`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
