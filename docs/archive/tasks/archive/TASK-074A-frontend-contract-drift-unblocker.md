---
title: TASK-074A-frontend-contract-drift-unblocker
status: archived
phase: productization-platform
task_type: implementation
task_mode: blocking
owner: main-orchestration
depends_on:
  - TASK-074
write_set:
  - apps/web/src/lib/api-client/index.ts
  - apps/web/src/features/document/MarkdownExportSurface.tsx
  - apps/web/src/features/history/useHistoryInspectorState.ts
  - tasks/active/TASK-074A-frontend-contract-drift-unblocker.md
forbidden_paths:
  - .note/**
  - apps/api/**
  - packages/contracts/**
related_requirements:
  - TASK-073A
  - TASK-074
review_required: false
---

# TASK-074A: Frontend Contract Drift Unblocker

## 목표

현재 product API public contract에 맞게 web API client와 호출부의 request body를 최소 수정한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`, `docs/product/README.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.
- `CreateMarkdownExportRequestDto`는 `{ filename?: string }`만 public input으로 허용한다.
- checkpoint 생성 public input은 route `documentId`와 body `{ message: string }`만 사용한다.

## 범위

### 포함

- `exportMarkdown` 호출이 route/path `documentId`와 body `{ filename?: string }`만 보내도록 정렬한다.
- `createCheckpoint` 호출이 route/path `documentId`와 body `{ message: string }`만 보내도록 정렬한다.
- web typecheck를 복구한다.

### 제외

- 시각 UI redesign.
- auth/session API 구현.
- backend contract 변경.
- TASK-080/TASK-081 범위의 product UI migration.

## 계약과 의존성

| Task        | Mode       | Depends on | Unlocks                | Notes                               |
| ----------- | ---------- | ---------- | ---------------------- | ----------------------------------- |
| `TASK-074A` | `blocking` | `TASK-074` | `TASK-075`, `TASK-079` | web call-site contract drift만 해소 |

- 안정 contract: export body는 `filename`만 허용하고, checkpoint body는 `message`만 허용한다.
- mock 허용 여부: 기존 web API client mock replacement point 유지.

## Write Set

수정 가능:

- `apps/web/src/lib/api-client/index.ts`
- `apps/web/src/features/document/MarkdownExportSurface.tsx`
- `apps/web/src/features/history/useHistoryInspectorState.ts`
- `tasks/active/TASK-074A-frontend-contract-drift-unblocker.md`

수정 금지:

- `.note/**`
- `apps/api/**`
- `packages/contracts/**`

## 인수 조건

- web export request body에서 `documentId`, `properties`, `markdownBody`를 보내지 않는다.
- web checkpoint request body에서 `documentId`, `authorMembershipId`, `markdownSnapshot`, `source`를 보내지 않는다.
- web typecheck가 통과한다.

## 검증

- 실행 명령: `fnm use`
- 실행 명령: `node -v`
- 실행 명령: `pnpm -v`
- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck가 product API contract와 일치하며 통과한다.
- 결과:
  - `fnm use`: 통과, Node v24.15.0 선택.
  - `node -v`: `v24.15.0`.
  - `pnpm -v`: `10.28.2`.
  - `pnpm --filter @rme/web typecheck`: 통과.

## Review

- Spec compliance review 필요 여부: 해당 없음.
- Code quality review 필요 여부: 해당 없음.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: TASK-080/TASK-081 visual UI 작업을 시작하지 않는다.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- 사용자 승인에 따라 TASK-074 backend merge 이후 별도 unblocker commit으로 처리한다.
- 공식 문서 업데이트는 필요하지 않다.
- Follow-up/blocker 없음.
