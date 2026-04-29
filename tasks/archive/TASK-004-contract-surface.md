---
title: TASK-004-contract-surface
status: archived
phase: phase-0
task_type: contract
owner: codex-main
depends_on: []
write_set:
  - packages/contracts/**
  - tasks/active/TASK-004-contract-surface.md
  - tasks/archive/TASK-004-contract-surface.md
  - .note/02-need-to-solve.md
forbidden_paths:
  - apps/api/**
  - apps/web/**
  - docs/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
review_required: true
---

# TASK-004: Contract Surface

## 목표

병렬 backend/frontend/e2e 작업이 같은 DTO와 realtime payload를 기준으로 구현되도록 `@rme/contracts` surface를 확장한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Seed review context DTO.
- Workspace/project/folder/document/member DTO.
- Document detail DTO.
- Collaboration session DTO.
- Awareness cursor/selection DTO.
- Artifact reference DTO.
- Autosave/revision/publication/checkpoint DTO.
- Sync status DTO 확장.
- Contract type surface assertion.

### 제외

- API mapper 구현.
- Backend persistence 구현.
- Frontend UI 구현.
- Auth/login flow 구현.

## 계약과 의존성

- 선행 task: 없음.
- 안정 contract: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- mock 허용 여부: downstream UI는 이 contract에 맞춘 mock data를 사용할 수 있다.

## Write Set

수정 가능:

- `packages/contracts/**`
- `tasks/active/TASK-004-contract-surface.md`
- `tasks/archive/TASK-004-contract-surface.md`
- `.note/02-need-to-solve.md`

수정 금지:

- `apps/api/**`
- `apps/web/**`
- `docs/**`

## 인수 조건

- `@rme/contracts`가 seed context, membership identity, document detail, collaboration session, awareness, checkpoint/revision/publication, artifact reference, sync status DTO를 export한다.
- Autosave, revision, publication, sync status가 같은 타입으로 뭉개지지 않는다.
- API/domain branded ID와 contract DTO는 mapper를 통해 연결될 수 있도록 명시적 DTO surface를 유지한다.
- Downstream backend/frontend workers가 이 contract만 보고 mock 또는 API integration을 시작할 수 있다.

## 검증

- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 기대 결과: contract typecheck가 통과한다.
- 실행 명령: `pnpm typecheck`
- 기대 결과: repo TypeScript build가 통과한다.
- 실행 명령: `pnpm format:check`
- 기대 결과: formatting check가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요. `packages/contracts`가 `apps/**`를 import하지 않아야 한다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- Issue 4 해결 작업.

## 검증 결과

- `pnpm --filter @rme/contracts typecheck`: 통과.
- `pnpm typecheck`: 통과.
- `pnpm lint`: 통과.
- `pnpm arch:check`: 통과.
- `pnpm format:check`: 통과.

## Follow-up

- API implementation task must add explicit domain-to-DTO mapper files before exposing these contracts from Nest controllers or realtime adapters.
- UI mock tasks may use `SeedReviewContextDto`, but integration tasks must replace mocks through API/realtime clients.
