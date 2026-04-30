---
title: TASK-063-tiptap-yjs-presence-and-collaboration-caret
status: archived
phase: P10
task_type: parallel-ui
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-062
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/styles/**
  - e2e/ce-01-concurrent-editing.spec.ts
  - e2e/ce-02-presence.spec.ts
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - REQ-PRESENCE-MEMBER-AWARENESS
  - REQ-IDENTITY-MEMBERSHIP
review_required: true
---

# TASK-063: Tiptap/Yjs Presence And Collaboration Caret

## 목표

Render member-aware remote cursor and selection presence inside the real Tiptap collaboration
surface.

## 배경

- Official CE-02 criteria: `docs/compliance/subject-matrix.md`.
- Product criteria: `docs/product/editor/presence.md`.
- Collaboration engine decision: ADR-0002 and the Tiptap/Yjs/Hocuspocus POC.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Connect Tiptap collaboration caret rendering to workspace membership identity and color.
- Show compact remote member labels near cursor/selection.
- Keep or redesign the active member surface as secondary evidence only.
- Update CE-01 and CE-02 e2e coverage for convergence and positioned presence.

### 제외

- Chat, comments, mentions, or viewport-following.
- Production auth or account management.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                             |
| ---------- | ------------- | ---------- | ---------- | --------------------------------- |
| `TASK-063` | `blocking-ui` | `TASK-062` | `TASK-067` | Requires real Tiptap editor core. |

- 안정 contract: presence remains workspace-member-aware and does not mutate Markdown body.
- mock 허용 여부: seeded reviewer members are allowed.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `e2e/ce-01-concurrent-editing.spec.ts`
- `e2e/ce-02-presence.spec.ts`

수정 금지:

- `.note/**`
- Workspace membership domain model unless promoted by `TASK-066`.

## 인수 조건

- Remote cursor and selection are rendered in editor content with member color.
- A compact member label appears near the remote caret/selection and does not permanently cover
  editable text.
- A separate compact active-members surface may exist, but it is not the only presence evidence.
- Collaboration state still converges for concurrent editing.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts`
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm test:e2e` -> passed, including CE-01 and CE-02.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not reinterpret CE-02 as member list presence only.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
