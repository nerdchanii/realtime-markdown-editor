---
title: TASK-076-current-markdown-projection-serialization-contract
status: todo
phase: P10
task_type: contract
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-075
write_set:
  - apps/web/src/features/editor/**
  - apps/collab/src/**
  - apps/api/src/modules/documents/**
  - packages/contracts/src/http/**
  - docs/architecture/backend.md
  - docs/product/editor/rich-preview.md
  - docs/product/editor/history.md
  - docs/product/editor/markdown-export.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-01
  - CE-03
  - CE-04
  - CE-05
  - REQ-MARKDOWN-PORTABILITY
review_required: true
---

# TASK-076: Current Markdown Projection And Serialization Contract

## 목표

Rich Tiptap state가 durable Markdown projection으로 저장, export, checkpoint되는 product serialization contract를 확정한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- editor decision: `docs/adr/0007-rich-markdown-authoring-surface.md`.
- dependencies: `TASK-075`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Actual `EditorContent` collaboration editor instance wiring 확인/수정.
- Tiptap Markdown extension serialization path.
- DB latest Markdown projection update contract.
- Live Yjs absence 시 DB Markdown bootstrap.
- Export/checkpoint creation uses server-resolved current content.

### 제외

- Raw Markdown source editor.
- Source/preview split.
- Standalone preview pane.

## 계약과 의존성

| Task       | Mode       | Depends on | Unlocks                            | Notes                                  |
| ---------- | ---------- | ---------- | ---------------------------------- | -------------------------------------- |
| `TASK-076` | `blocking` | `TASK-075` | `TASK-077`, `TASK-078`, `TASK-081` | serialization and current content gate |

- 안정 contract: ADR-0007 rich authoring surface.
- Route contract: `GET/PUT /documents/:documentId/content`,
  `POST /documents/:documentId/export`, and `POST /documents/:documentId/checkpoints`
  from `packages/contracts/src/http/routes.ts`.
- mock 허용 여부: no product-path mock for content source.
- If serialization requires route/DB contract changes, stop and route to main orchestrator.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/collab/src/**`
- `apps/api/src/modules/documents/**`
- `packages/contracts/src/http/**`
- `docs/architecture/backend.md`
- `docs/product/editor/rich-preview.md`
- `docs/product/editor/history.md`
- `docs/product/editor/markdown-export.md`

수정 금지:

- `.note/**`

## 인수 조건

- Actual `EditorContent` instance is wired to collaboration extensions.
- Markdown serialization uses the Tiptap Markdown extension path.
- DB stores a latest Markdown projection.
- Opening a document can bootstrap from DB Markdown when live Yjs state is absent.
- Export and checkpoint creation use server-resolved current content, not untrusted full-body client snapshots.
- Product docs stay aligned with the server-resolved content/export/checkpoint contract.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck가 통과한다.
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: CE-01 and CE-05 e2e pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: editor surface must stay editor-first and ADR-0007-aligned.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- This is the blocking content/serialization contract before downstream collab/editor product work.
