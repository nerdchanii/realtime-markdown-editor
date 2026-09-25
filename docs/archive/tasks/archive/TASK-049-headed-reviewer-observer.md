---
title: TASK-049-headed-reviewer-observer
status: archived
phase: user-request
task_type: docs
task_mode: integration
owner: codex
depends_on:
  - TASK-045
write_set:
  - package.json
  - scripts/**
  - tasks/active/TASK-049-headed-reviewer-observer.md
  - tasks/archive/TASK-049-headed-reviewer-observer.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
review_required: false
---

# TASK-049: Headed Reviewer Observer

## 목표

Add a headed Playwright observer script that opens four reviewer windows in a 2x2 grid.

## 배경

- User requested a headed mode observer script with a name other than `monitor:reviewer`.
- Official CE verification remains automated e2e; this script is for manual observation only.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Package script for launching four headed Chromium windows.
- Script-level options for base URL, document, window bounds, and member layout.

### 제외

- Changing e2e acceptance or fixing the blocked `TASK-048` verification command.
- New product behavior.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks | Notes                       |
| ---------- | ------------- | ---------- | ------- | --------------------------- |
| `TASK-049` | `integration` | `TASK-045` | 없음    | Manual reviewer observation |

- 안정 contract: `pnpm dev` serves the reviewer app at `http://127.0.0.1:5173`.
- mock 허용 여부: not applicable.

## Write Set

수정 가능:

- `package.json`
- `scripts/**`
- `tasks/active/TASK-049-headed-reviewer-observer.md`
- `tasks/archive/TASK-049-headed-reviewer-observer.md`

수정 금지:

- `.note/**`

## 인수 조건

- `pnpm reviewer:observe` launches four headed Chromium windows.
- Windows are arranged in a 2x2 grid using configurable screen bounds.
- Script does not change automated e2e behavior.

## 검증

- 실행 명령: `pnpm format:check`
- 실행 명령: `pnpm exec eslint scripts/open-reviewer-grid.mjs`
- 실행 명령: `node --check scripts/open-reviewer-grid.mjs`
- 기대 결과: commands pass on Node `v24.15.0`.

## 검증 결과

- Runtime: `node -v` -> `v24.15.0`; `pnpm -v` -> `10.28.2`.
- `pnpm format:check` -> passed.
- `pnpm exec eslint scripts/open-reviewer-grid.mjs` -> passed.
- `node --check scripts/open-reviewer-grid.mjs` -> passed.

## Review

- Spec compliance review 필요 여부: 해당 없음.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: keep separate from blocked `TASK-048`.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This is an operator convenience script, not CE acceptance evidence.
- Added `pnpm reviewer:observe`.
- Usage assumes `pnpm dev` is already running.
- Example bounds override:
  `pnpm reviewer:observe -- --width=1920 --height=1080 --left=0 --top=0`.
