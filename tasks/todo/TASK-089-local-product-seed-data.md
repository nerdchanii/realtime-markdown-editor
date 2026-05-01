---
title: TASK-089-local-product-seed-data
status: todo
phase: P11
task_type: ops
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-083
write_set:
  - scripts/**
  - e2e/support/**
  - docs/product/README.md
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/workspace/user-membership.md
  - docs/requirements/items/REQ-DEV-LOCAL-PRODUCT-SEED-DATA.md
  - tasks/todo/TASK-089-local-product-seed-data.md
  - tasks/active/TASK-089-local-product-seed-data.md
  - tasks/archive/TASK-089-local-product-seed-data.md
forbidden_paths:
  - .note/**
  - apps/web/src/features/editor/adapters/**
related_requirements:
  - REQ-DEV-LOCAL-PRODUCT-SEED-DATA
  - REQ-WORKSPACE-HIERARCHY
  - REQ-IDENTITY-MEMBERSHIP
review_required: true
---

# TASK-089: Local Product Seed Data

## 목표

Local development에서 realistic product seed data를 real local database에 idempotent하게 bootstrap할 수 있게 한다.

## 배경

- `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`는 reviewer/test fixture 느낌의 seed를 줄이고 실제 제품에 가까운 local workspace를 요구한다.
- Seed는 normal runtime dependency가 아니며 production-like environment에서 실행되면 안 된다.

## 범위

### 포함

- Canonical seed spec 또는 helper.
- 명시적 local seed command.
- Stable IDs 기반 idempotent users, memberships, workspace, project, folders, documents.
- ADR, architecture, product, domain docs의 curated subset을 default seed document로 사용.
- e2e product fixtures와 local dev seed의 drift 감소.

### 제외

- Production account management.
- Live Yjs state seeding.
- 모든 docs 파일 import.
- Checkpoint history seeding 기본화.

## 인수 조건

- local developer가 migrations 이후 명시적 command로 seed를 넣을 수 있다.
- seed command는 production-like env에서 거부된다.
- seed command는 실제 `DATABASE_URL` 값을 출력하지 않는다.
- e2e fixture와 local seed가 canonical seed source 또는 helper를 공유한다.

## 검증

- 실행 명령: local seed command dry/run with safe local DB env
- 기대 결과: idempotent seed succeeds.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/api test`
- 기대 결과: API tests pass if seed/API helpers changed.

## Review

- Ops/security review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
