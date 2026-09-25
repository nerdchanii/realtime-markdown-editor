---
title: TASK-093-presence-caret-label-legibility-closeout
status: archived
phase: auto-20260502-0901-presence-legibility-closeout
task_type: verification
task_mode: blocking
owner: codex
depends_on:
  - TASK-092
write_set:
  - e2e/ce-02-presence.spec.ts
  - e2e/support/product-fixtures.ts
  - docs/requirements/registry.md
  - docs/requirements/items/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md
  - docs/requirements/completed/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md
  - tasks/exec-plan/auto-20260502-0901-presence-legibility-closeout.md
  - tasks/archive/TASK-093-presence-caret-label-legibility-closeout.md
forbidden_paths:
  - .note/**
  - README.md
  - apps/api/**
  - apps/collab/**
  - apps/web/src/**
  - packages/**
related_requirements:
  - REQ-PRESENCE-CARET-LABEL-LEGIBILITY
  - REQ-PRESENCE-MEMBER-AWARENESS
  - CE-02-PRESENCE
review_required: true
---

# TASK-093: Presence Caret Label Legibility Closeout

## 목표

Close `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` with fresh CE-02 verification and requirement registry
state cleanup.

## 배경

- `TASK-092` classified `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` as complete-with-evidence but left it
  in `docs/requirements/items/`.
- The first fresh CE-02 run found stale verification coupling to a removed `sync-status` test id.
- The CE-02 product behavior still needs to prove remote cursor, selection, and Bob display-name
  label visibility.

## 범위

### 포함

- Refresh CE-02 setup wait to use the current visible sync label instead of the removed test id.
- Add bounded retry to e2e product session creation so Playwright does not race API startup.
- Preserve CE-02 assertions for Bob remote cursor, selection, and display-name label.
- Move `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` to completed requirements.
- Update the requirements registry.
- Record verification evidence.

### 제외

- Presence implementation changes.
- API, collab runtime, domain, or contract changes.
- Broader CE acceptance decoupling.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks | Notes                      |
| ---------- | ---------- | ---------- | ------- | -------------------------- |
| `TASK-093` | `blocking` | `TASK-092` | 완료    | Requirement closeout only. |

- 안정 contract: CE-02 and `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` acceptance.
- mock 허용 여부: 허용하지 않음.

## 인수 조건

- CE-02 verifies Bob's remote cursor is visible on Alice's screen.
- CE-02 verifies Bob's remote selection is visible on Alice's screen.
- CE-02 verifies Bob's display name appears with the remote cursor.
- Requirement metadata is `status: done` and `taskability: done`.
- Registry lists the requirement under completed requirements, not planned items.

## 검증

- 실행 명령: `DATABASE_URL=<local test db> scripts/with-node.sh pnpm test:e2e -- e2e/ce-02-presence.spec.ts`
- 결과: pass with `COLLAB_PORT=4001` and `RME_COLLAB_PORT=4001` so the collab runtime matches the
  API-issued realtime URL. CE-02 verifies Bob's remote caret, visible selection decoration, member
  label, and 2px caret width from Alice's product session.
- 실행 명령: `scripts/with-node.sh pnpm requirements:index`
- 결과: pass. `REQ-PRESENCE-CARET-LABEL-LEGIBILITY` is indexed from
  `docs/requirements/completed/REQ-PRESENCE-CARET-LABEL-LEGIBILITY.md` as `done`.
- 실행 명령: `scripts/with-node.sh pnpm format:check`
- 결과: pass.
- Product quality gate 확인: CE-02 evidence remains product-session based and still checks member
  identity, cursor, selection, and label visibility.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 낮음.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: implementation runtime files are forbidden and unchanged.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] 관련 product quality gate 결과 또는 follow-up을 기록했다.
- [x] follow-up 또는 blocker를 기록했다.
