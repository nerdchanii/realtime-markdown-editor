---
title: TASK-103-local-product-seed-spec
status: archived
phase: P12
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-089
  - TASK-092
write_set:
  - package.json
  - scripts/product-seed-spec.mjs
  - scripts/seed-local-product.mjs
  - e2e/support/product-fixtures.ts
  - e2e/task-045-reviewer-flow.spec.ts
  - docs/requirements/items/REQ-DEV-LOCAL-PRODUCT-SEED-DATA.md
  - docs/requirements/completed/REQ-DEV-LOCAL-PRODUCT-SEED-DATA.md
  - tasks/archive/TASK-103-local-product-seed-spec.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-DEV-LOCAL-PRODUCT-SEED-DATA
review_required: true
---

# TASK-103: Local Product Seed Spec

## Goal

Close `REQ-DEV-LOCAL-PRODUCT-SEED-DATA` by replacing fixture-like default local seed data with a
canonical product seed spec shared by the CLI seed command and e2e product fixtures.

## Scope

- Added `scripts/product-seed-spec.mjs` as the canonical seed source.
- Added the explicit `pnpm db:seed:dev` command alias.
- Updated the local seed script to load curated repository docs from `docs/architecture`,
  `docs/product`, `docs/domain`, and `docs/adr`.
- Renamed the visible default workspace/project/documents to product-like names.
- Kept stable IDs for compatibility with collaboration/runtime tests.
- Updated e2e fixtures to reuse the same seed spec as the local seed command.
- Tightened local seed safety so production mode and non-local database hosts are refused.

## Verification

- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor scripts/with-node.sh pnpm db:migrate`
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor scripts/with-node.sh pnpm db:seed:dev`
- Re-ran the same seed command a second time to verify idempotent upserts.
- DB spot check: canonical workspace/project names exist, the four canonical seed documents exist,
  two canonical link edges exist, and the primary document has two seeded properties.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/realtime_markdown_editor COLLAB_PORT=4001 RME_COLLAB_PORT=4001 scripts/with-node.sh pnpm test:e2e -- e2e/task-045-reviewer-flow.spec.ts`
- `scripts/with-node.sh pnpm lint`
- `scripts/with-node.sh pnpm format:check`

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
