---
title: TASK-083-productization-verification-gate
status: archived
phase: P10
task_type: verification
task_mode: verification
owner: unassigned
depends_on:
  - TASK-082
write_set:
  - README.md
  - docs/compliance/subject-matrix.md
  - docs/requirements/registry.md
  - tasks/active/**
  - tasks/archive/**
  - e2e/**
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
  - CE-05
review_required: true
---

# TASK-083: Productization Verification Gate

## 목표

Productization 결과가 tests뿐 아니라 product/runtime expectation과 CE evidence를 충족하는지 최종 검증한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-082`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Full `pnpm check`.
- Full `pnpm test:e2e`.
- Manual reviewer path documentation.
- README local Postgres/object storage/product login/bootstrap/reviewer flow update.
- Compliance matrix evidence truth check.
- Deferred items placed in backlog rather than hidden as implementation gaps.
- Evidence that CE-01 through CE-05 are product validation stories exercised through normal product behavior.

### 제외

- Feature implementation except test robustness fixes in `e2e/**`.
- New product scope not in official docs or `05-productization-platform.md`.
- Fixing missing prerequisite functionality inside the final gate.
- Adding user-facing evaluation-harness UI.

## 계약과 의존성

| Task       | Mode           | Depends on | Unlocks | Notes              |
| ---------- | -------------- | ---------- | ------- | ------------------ |
| `TASK-083` | `verification` | `TASK-082` | 완료    | final release gate |

- 안정 contract: integrated product runtime from `TASK-082`.
- mock 허용 여부: normal reviewer path cannot require seed/review APIs except dev bootstrap.
- Verify seed/review routes remain dev-only according to `packages/contracts/src/http/routes.ts`.
- Failures become blocker notes, backlog items, documentation/evidence corrections, or scoped
  e2e robustness fixes. Missing product capabilities must not be hidden inside the final gate.

## Write Set

수정 가능:

- `README.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `tasks/active/**`
- `tasks/archive/**`
- `e2e/**`

수정 금지:

- `.note/**`

## 인수 조건

- `pnpm check` passes.
- Full `pnpm test:e2e` passes.
- Manual reviewer path is documented.
- README explains product login/bootstrap, local Postgres/object storage setup, and reviewer flow.
- Compliance matrix evidence statements are true for product code.
- Known deferred items are in backlog, not hidden in implementation gaps.
- Normal UI remains product-oriented and does not expose evaluation-harness language.

## 검증

- 실행 명령: `pnpm check`
- 기대 결과: full check passes.
- 실행 명령: `pnpm test:e2e`
- 기대 결과: full e2e suite passes.
- 실행 명령: manual smoke of login, open document, collaborate, undo/redo, checkpoint, refresh, export, upload image.
- 기대 결과: reviewer product flow works.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: final evidence must cite official docs, not `.note/**`.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Final gate commands: `pnpm check`, `pnpm test:e2e`.

## TASK-083 Verification Record

Date: 2026-05-01

Environment:

- Worktree: `.worktrees/task-083-productization-verification-gate`
- Base commit: `5138c787c5ee738587c30862ab109c2beaac6649`
- Database URL used for verification:
  `postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor`
- Postgres host port: `55434`
- Prisma client generation was required after dependency install because package build scripts were
  not run during install.

Automated verification:

- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor POSTGRES_HOST_PORT=55434 scripts/with-node.sh pnpm db:migrate`
  - Result: passed.
  - Evidence: Docker Postgres became ready, database `realtime_markdown_editor` was ensured, and
    migration `20260430000000_init` was applied successfully.
- `scripts/with-node.sh pnpm db:generate`
  - Result: passed.
  - Evidence: Prisma Client v6.19.0 generated successfully.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor POSTGRES_HOST_PORT=55434 scripts/with-node.sh pnpm check`
  - Result: passed.
  - Evidence: typecheck, lint, format check, architecture check, and workspace tests all passed;
    API test output reported 47 passed tests, web 3 passed tests, collab 1 passed test, contracts
    2 passed tests.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor POSTGRES_HOST_PORT=55434 scripts/with-node.sh pnpm test:e2e -- e2e/product-properties.spec.ts`
  - Result: passed after the scoped locator robustness fix.
  - Evidence: 1/1 Playwright test passed.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/realtime_markdown_editor POSTGRES_HOST_PORT=55434 scripts/with-node.sh pnpm test:e2e`
  - Result: passed.
  - Evidence: 13/13 Playwright tests passed.

Manual reviewer path evidence:

- Login/bootstrap: e2e product fixtures create local DB product memberships and open sessions
  through `POST /auth/session`; README now documents browser-origin local session bootstrap for
  `alice@example.test` and `bob@example.test`.
- Open document: `e2e/task-045-reviewer-flow.spec.ts` and
  `e2e/product-workspace-document-entrypoints.spec.ts` exercise workspace navigation and product
  document entrypoints.
- Collaboration and presence: `e2e/ce-01-concurrent-editing.spec.ts`,
  `e2e/ce-02-presence.spec.ts`, and `e2e/task-050-four-session-collaboration.spec.ts` exercise
  product-session members on shared workspace documents.
- Undo/redo: `e2e/ce-05-rich-preview.spec.ts` verifies toolbar undo/redo on the collaboration
  editor with `data-undo-source="collaboration"`.
- Checkpoint and refresh: `e2e/ce-04-history.spec.ts` verifies product auth/session,
  storage-backed document content, checkpoint creation, read-only snapshot inspection, and history
  persistence after reload.
- Export: `e2e/ce-05-rich-preview.spec.ts` verifies Markdown export preserves rich editor content;
  `e2e/task-045-reviewer-flow.spec.ts` covers export in the integrated reviewer path.
- Image upload: `e2e/ce-05-rich-preview.spec.ts` verifies toolbar image insertion through the
  document artifact API and exported `rme-artifact://documents/` Markdown reference.

Boundary notes:

- `docs/requirements/registry.md` was intentionally not read, edited, staged, restored, or
  committed for TASK-083 because the user marked it dirty/unrelated in the main worktree.
- `.note/**` was not touched or cited as official evidence.
- Normal reviewer evidence uses product fixtures, sessions, and document APIs. Dev-only seed route
  boundaries remain covered by contract metadata and API tests in `pnpm check`; `/review-context/seed`
  is not required by the documented reviewer product path except as a local/dev compatibility route.
- Deferred product scope remains explicit in README and existing backlog notes. No new product
  feature scope was added in this verification gate.

Residual notes:

- Local port `55432` was already allocated during verification, so the gate used `55434`.
- Sandbox execution blocked Docker access, Prisma engine cache writes, `tsx` IPC pipes, and browser
  e2e execution; those commands were rerun with scoped escalation.
