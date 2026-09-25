---
title: TASK-094-product-account-surface-and-policy
status: archived
phase: auto-20260502-0930-product-account-surface
task_type: implementation
task_mode: blocking
owner: codex
depends_on:
  - TASK-092
write_set:
  - apps/web/src/app/App.tsx
  - apps/web/src/app/AuthScreen.tsx
  - apps/web/src/app/TopBar.tsx
  - apps/web/src/app/product-workspace-providers.ts
  - apps/web/src/app/product-workspace-types.ts
  - apps/web/src/styles/global.css
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - docs/product/workspace/user-membership.md
  - docs/product/ui-capability-gap-log.md
  - tasks/exec-plan/auto-20260502-0930-product-account-surface.md
  - tasks/archive/TASK-094-product-account-surface-and-policy.md
forbidden_paths:
  - .note/**
  - README.md
  - apps/api/**
  - apps/collab/**
  - packages/**
related_requirements:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-EDITOR-FIRST-UI-REFRESH
  - REQ-IDENTITY-MEMBERSHIP
review_required: true
---

# TASK-094: Product Account Surface and Policy

## 목표

Improve the visible account surface for `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` without claiming
unsupported account mutation flows are complete.

## 배경

- `TASK-092` classified `TASK-085` as partial because login/logout/session restore exist, but the
  auth screen still used reviewer/bootstrap wording and profile/account management was only a
  shallow placeholder.
- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` also requires profile updates and a deactivate/delete policy.
- The current API exposes session create/get/delete but not account create/profile/deactivate
  mutations.

## 범위

### 포함

- Replace primary auth copy and submit text with product sign-in language.
- Add visible sign-in failure feedback.
- Keep dev seed shortcuts in development builds, labeled as local seed accounts.
- Move settings access into the profile menu.
- Add scoped User, Workspace, and Project settings panels with read-only identity data from the
  authenticated session and workspace navigation model.
- Replace static top-bar workspace/project labels with product model labels.
- Document account deactivation/delete policy.
- Update requirement and UI gap tracking to keep the remaining blockers explicit.

### 제외

- Account creation API or UI.
- Profile update mutation.
- Account deactivation mutation.
- Workspace member administration mutations.
- Contract or backend route changes.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                   | Notes                                  |
| ---------- | ---------- | ---------- | ------------------------- | -------------------------------------- |
| `TASK-094` | `blocking` | `TASK-092` | next account API contract | Frontend/product-doc improvement only. |

- 안정 contract: session API remains the source of current user and membership identity.
- mock 허용 여부: product account surface uses product session/navigation state; dev seed shortcuts
  remain explicitly development-scoped.

## 인수 조건

- Auth screen primary path reads as product sign-in, not reviewer bootstrap.
- Invalid credentials show a visible error.
- Profile menu contains account, workspace, project settings entries and sign out.
- Settings dialog is scoped by User, Workspace, and Project and does not imply unsupported writes.
- Top bar workspace/project chips are populated from product state.
- Account deactivation/delete policy preserves membership/auditability semantics.
- Requirement docs keep `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` open for account creation/profile
  update/deactivation mutations.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 결과: pass.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web test`
- 결과: pass. Initial sandboxed run failed because `tsx` could not open its IPC pipe; rerun outside
  the sandbox passed 5 tests.
- 실행 명령: `scripts/with-node.sh pnpm requirements:index`
- 결과: pass. `REQ-PRODUCTION-ACCOUNT-MANAGEMENT` remains indexed as an open planned
  product-foundation requirement with the next account mutation blockers recorded.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 결과: pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 보통.
- Boundary review 필요 여부: 낮음. Backend/contracts intentionally unchanged.
- Orchestration guardrail 확인: `.note/**` and pre-existing `README.md` changes are not touched.

## Follow-up

- Add account create/local bootstrap contract and UI.
- Add profile update endpoint and replace User settings read-only display with editable controls.
- Add account deactivation endpoint following the documented retention/auditability policy.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`에 기록했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] 관련 product quality gate 결과 또는 follow-up을 기록했다.
- [x] follow-up 또는 blocker를 기록했다.
