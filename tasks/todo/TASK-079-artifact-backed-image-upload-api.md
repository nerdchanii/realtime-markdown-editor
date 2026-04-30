---
title: TASK-079-artifact-backed-image-upload-api
status: todo
phase: P10
task_type: parallel-backend
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-072
  - TASK-073
write_set:
  - apps/api/src/modules/documents/**
  - apps/api/src/modules/artifacts/**
  - apps/api/src/**/artifacts/**
  - packages/contracts/src/http/**
  - apps/api/src/**/*.spec.ts
forbidden_paths:
  - .note/**
  - apps/web/**
  - apps/collab/**
related_requirements:
  - CE-05
review_required: true
---

# TASK-079: Artifact-Backed Image Upload API

## 목표

Editor image insertion을 노출하기 전에 durable artifact-backed image upload API를 추가한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- dependencies: `TASK-072`, `TASK-073`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Image upload through artifact storage port.
- Metadata: content type, checksum, size, owner document/workspace context, storage key.
- Provider-internal detail 없는 editor-insertable reference.
- Validation errors for unsupported content types and oversized uploads.

### 제외

- Editor image insertion UI.
- Checkpoint artifact behavior.
- External object storage provider-specific UI.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks                | Notes                    |
| ---------- | ---------- | ---------------------- | ---------------------- | ------------------------ |
| `TASK-079` | `parallel` | `TASK-072`, `TASK-073` | `TASK-081`, `TASK-082` | durable image upload API |

- 안정 contract: artifact metadata schema and validation envelope.
- Canonical route source: `POST /documents/:documentId/images` from
  `packages/contracts/src/http/routes.ts`.
- mock 허용 여부: dev/test artifact adapter allowed.
- If image contract changes are needed, stop and route to `TASK-071`/main orchestrator.

## Write Set

수정 가능:

- `apps/api/src/modules/documents/**`
- `apps/api/src/modules/artifacts/**`
- `apps/api/src/**/artifacts/**`
- `packages/contracts/src/http/**`
- `apps/api/src/**/*.spec.ts`

수정 금지:

- `.note/**`
- `apps/web/**`
- `apps/collab/**`

## 인수 조건

- Image upload writes payload through artifact storage port.
- Metadata records content type, checksum, size, owner document/workspace context, and storage key.
- Returned URL/reference can be inserted into the editor without exposing provider internals.
- Unsupported content types and oversized uploads fail with stable validation errors.

## 검증

- 실행 명령: `pnpm --filter @rme/api test`
- 기대 결과: API tests가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: durable insertion must wait for artifact-backed upload.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- May run after `TASK-072` and `TASK-073` if write set is made disjoint from checkpoint artifact work.
