---
title: TASK-021-api-collaboration-session-contract
status: todo
phase: P2
task_type: contract
task_mode: parallel-backend
owner: unassigned
depends_on:
  - TASK-020
write_set:
  - apps/api/src/modules/collaboration/**
  - apps/api/src/modules/documents/**
  - packages/contracts/src/realtime/**
  - packages/contracts/src/http/**
forbidden_paths:
  - .note/**
  - apps/collab/**
  - apps/web/**
related_requirements:
  - CE-01
  - CE-02
  - CE-03
review_required: true
---

# TASK-021: API Collaboration Session Contract

## 목표

Implement provider-neutral collaboration session issuance in the API.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/02-collaboration-persistence.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- API route/use case for seeded document/member collaboration sessions.
- Contract DTOs for session payloads.
- Explicit mapping from domain/application data into contract DTOs.

### 제외

- Hocuspocus runtime implementation.
- Web editor adapter implementation.
- Provider-specific Yjs, Hocuspocus, Tiptap, or ProseMirror types in API domain files.

## 계약과 의존성

| Task       | Mode               | Depends on | Unlocks    | Notes                                  |
| ---------- | ------------------ | ---------- | ---------- | -------------------------------------- |
| `TASK-021` | `parallel-backend` | `TASK-020` | `TASK-024` | Provider-neutral API session contract. |

- 안정 contract: collaboration runtime topology from `TASK-020`.
- mock 허용 여부: seeded local session data is allowed.

## Write Set

수정 가능:

- `apps/api/src/modules/collaboration/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/realtime/**`
- `packages/contracts/src/http/**`

수정 금지:

- `.note/**`
- `apps/collab/**`
- `apps/web/**`

## 인수 조건

- API returns collaboration session DTO for seeded document and member.
- Session contract includes document key, realtime URL, current member, allowed members, and sync state.
- API maps domain/application data into contract DTOs explicitly.
- No Yjs, Hocuspocus, Tiptap, or ProseMirror types enter API domain files.

## 검증

- 실행 명령: `pnpm --filter @rme/api typecheck`
- 실행 명령: `pnpm --filter @rme/contracts typecheck`
- 실행 명령: `pnpm arch:check`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: keep API provider-neutral and do not edit forbidden paths.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Unblocks `TASK-024` with `TASK-022` and `TASK-023`.
