---
title: TASK-066-user-and-membership-boundary
status: archived
phase: P10
task_type: docs
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-060
write_set:
  - apps/web/src/app/**
  - apps/web/src/features/workspace/**
  - apps/web/src/features/editor/**
  - README.md
  - docs/product/workspace/user-membership.md
  - docs/backlog/README.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRESENCE-MEMBER-AWARENESS
  - REQ-HISTORY-CHECKPOINTS
review_required: true
---

# TASK-066: User And Membership Boundary

## 목표

Clarify seeded users, workspace membership identity, and later production auth/workspace CRUD
staging.

## 배경

- Product criteria: `docs/product/workspace/user-membership.md`.
- Subject evidence uses seeded reviewer members for CE-01 through CE-05.
- `README.md` must let reviewers understand local accounts and mock boundaries.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Make reviewer member selection clear in route/UI/docs.
- Ensure presence and checkpoint authorship use workspace membership identity.
- Document seed/mock identity boundaries in `README.md` and product/backlog docs.
- Stage production auth, account management, and full workspace CRUD unless a later plan promotes
  them.

### 제외

- Production auth provider implementation.
- RBAC/admin controls.
- Full account management.

## 계약과 의존성

| Task       | Mode           | Depends on | Unlocks    | Notes                            |
| ---------- | -------------- | ---------- | ---------- | -------------------------------- |
| `TASK-066` | `parallel-app` | `TASK-060` | `TASK-067` | Mock boundary and route clarity. |

- 안정 contract: seeded Alice/Bob reviewer flow remains available.
- mock 허용 여부: allowed only as explicit reviewer setup.

## Write Set

수정 가능:

- `apps/web/src/app/**`
- `apps/web/src/features/workspace/**`
- `apps/web/src/features/editor/**`
- `README.md`
- `docs/product/workspace/user-membership.md`
- `docs/backlog/README.md`

수정 금지:

- `.note/**`
- Production auth integration code.

## 인수 조건

- Reviewer can tell which seeded member they are using.
- Presence and checkpoint authorship use workspace membership identity.
- Mock/seed identity is not presented as production auth.
- Full auth provider, account management, and production workspace CRUD are explicitly staged after
  CE recovery unless promoted by a later plan.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm format:check`
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm format:check` -> passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not hide mock identity behind production-sounding auth copy.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
