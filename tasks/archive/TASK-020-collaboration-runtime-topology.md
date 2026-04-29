---
title: TASK-020-collaboration-runtime-topology
status: archived
phase: P2
task_type: dependency
task_mode: blocking
owner: main-session
depends_on:
  - TASK-017
write_set:
  - package.json
  - pnpm-lock.yaml
  - pnpm-workspace.yaml
  - apps/collab/**
  - apps/api/package.json
  - apps/web/package.json
  - docs/architecture/backend.md
  - docs/domain/rules/collaboration-boundaries.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
  - CE-04
review_required: true
---

# TASK-020: Collaboration Dependency And Runtime Topology

## 목표

Collaboration dependencies and runtime topology are owned in one blocking task before API, collab,
or web realtime work begins.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Create `apps/collab` as the separate collaboration runtime package.
- Install collaboration dependencies in the packages that use them.
- Add root scripts for local API, web, and collab development.
- Record collaboration dependency ownership and runtime boundary in official architecture/domain docs.

### 제외

- API collaboration session implementation.
- Web editor provider integration.
- Live Yjs persistence, checkpoints, presence rendering, or history UI.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                                          |
| ---------- | ---------- | ---------- | ---------------------------------- | ---------------------------------------------- |
| `TASK-020` | `blocking` | `TASK-017` | `TASK-021`, `TASK-022`, `TASK-023` | Dependency owner and runtime package topology. |

- 안정 contract: existing Plan 01 seed review context and workspace shell.
- mock 허용 여부: runtime skeleton may be minimal; downstream realtime behavior is not implemented here.
- downstream work must not start until this task is archived.

## Write Set

수정 가능:

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `apps/collab/**`
- `apps/api/package.json`
- `apps/web/package.json`
- `docs/architecture/backend.md`
- `docs/domain/rules/collaboration-boundaries.md`

수정 금지:

- `.note/**`

## 인수 조건

- `apps/collab` exists as a separate runtime package.
- Dependency owner is recorded in this task file.
- Hocuspocus/Yjs/Tiptap dependencies are installed in the package that uses them.
- `apps/collab` does not import `apps/api/src/**`.
- Root scripts can start API, web, and collab in local development.

## 검증

- 실행 명령: `pnpm install`
- 실행 명령: `pnpm typecheck`
- 실행 명령: `pnpm arch:check`
- 실행 명령: `pnpm format:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: no downstream implementation starts before topology is archived.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Dependency owner: TASK-020.
- Hocuspocus/Yjs server dependencies are owned by `apps/collab`.
- Tiptap, Hocuspocus provider, and browser Yjs client dependencies are reserved in
  `apps/web/package.json` because TASK-020 owns package/lockfile changes for collaboration
  dependencies and later web tasks cannot edit package manifests.
- Verification:
  - `node -v` -> `v24.15.0`
  - `pnpm -v` -> `10.28.2`
  - `pnpm install` -> pass.
  - `pnpm typecheck` -> pass.
  - `pnpm arch:check` -> pass.
  - `pnpm format:check` -> pass.
  - `pnpm --filter @rme/collab typecheck` -> pass.
  - `rg -n "apps/api/src|@/modules|@rme/api" apps/collab package.json docs/architecture/backend.md docs/domain/rules/collaboration-boundaries.md`
    found no `apps/collab` import of API source.
- Review response: a reviewer flagged root `tsconfig.json` as outside TASK-020 write set. The root
  reference change was removed; `@rme/collab` remains directly verifiable through its filter command
  and `arch:check` still cruises `apps/collab/**`.
- Review response: a reviewer flagged that `RME_COLLAB_HOST` was only logged and not applied to the
  server bind address. `apps/collab` now passes `address: config.host` into Hocuspocus.
- Follow-up: current `arch:check` cruises `apps/collab`, but custom architecture script does not
  yet have a dedicated `apps/collab` -> `apps/api/src/**` failure rule. That script is outside
  TASK-020 write set, so enforcement strengthening should be handled by a later boundary task.
