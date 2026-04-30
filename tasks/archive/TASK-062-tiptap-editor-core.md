---
title: TASK-062-tiptap-editor-core
status: archived
phase: P10
task_type: parallel-ui
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-060
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/styles/**
  - apps/web/package.json
  - package.json
  - pnpm-lock.yaml
  - e2e/ce-05-rich-preview.spec.ts
forbidden_paths:
  - .note/**
related_requirements:
  - CE-05-RICH-PREVIEW
  - REQ-EDITOR-RICH-SOURCE-SPLIT
  - REQ-MARKDOWN-PORTABILITY
review_required: true
---

# TASK-062: Tiptap Editor Core

## 목표

Replace rich-mode preview bypass with an editable Tiptap editor surface that shares state with
Markdown source, split, and preview modes.

## 배경

- Official CE-05 criteria: `docs/compliance/subject-matrix.md`.
- Product criteria: `docs/product/editor/rich-preview.md`.
- POC reference: `docs/research/poc-001-collaboration-engine/prototypes/tiptap-yjs-hocuspocus/src/**`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Mount Tiptap `EditorContent` for rich editing.
- Reuse existing Tiptap/Yjs/Hocuspocus adapter work where possible.
- Keep Markdown source mode available.
- Define and implement split mode behavior for editable rich/source plus rendered preview.
- Update CE-05 e2e to prove heading, list, link, inline code, fenced code, quote, task marker, and
  table preservation to the supported Markdown portability boundary.

### 제외

- Remote collaboration caret UI beyond what is required to avoid breaking editor state.
- Workspace tree redesign.
- Properties/history redesign.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks                | Notes                  |
| ---------- | ------------- | ---------- | ---------------------- | ---------------------- |
| `TASK-062` | `blocking-ui` | `TASK-060` | `TASK-063`, `TASK-067` | Real rich editor core. |

- 안정 contract: Rich, Markdown, Split, and Preview modes share one document body state.
- mock 허용 여부: existing reviewer seed is allowed; rich editor must not depend on fake-only state.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `e2e/ce-05-rich-preview.spec.ts`

수정 금지:

- `.note/**`
- API or collab server contracts unless promoted by a task update.

## 인수 조건

- Rich mode is editable through Tiptap `EditorContent`.
- Markdown source mode remains available and edits the same document body.
- Split mode shows editable Tiptap rich surface and/or Markdown source beside rendered preview
  according to the product decision recorded in this task.
- Preview mode remains read-only.
- Mode switching preserves core Markdown structures as far as the chosen portability boundary allows.
- The implementation reuses POC Tiptap learnings instead of maintaining a separate fake rich renderer
  as the main editor.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: all commands pass.

## 검증 결과

- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm test:e2e e2e/ce-05-rich-preview.spec.ts` -> passed as part of the final full e2e run.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: do not change CE-05 acceptance without updating official docs first.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
