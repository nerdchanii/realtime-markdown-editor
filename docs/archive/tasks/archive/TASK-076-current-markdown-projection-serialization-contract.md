---
title: TASK-076-current-markdown-projection-serialization-contract
status: archived
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

Yjs/Tiptap live collaboration state에서 파생되는 portable Markdown projection contract를 확정한다.
Yjs provider state는 live editing source of truth이며, DB Markdown projection은 export,
checkpoint, fallback bootstrap을 위한 derived read model이다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- editor decision: `docs/adr/0007-rich-markdown-authoring-surface.md`.
- dependencies: `TASK-075`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Actual `EditorContent` collaboration editor instance wiring 확인/수정.
- Tiptap Markdown extension serialization path.
- Derived DB latest Markdown projection update contract.
- Live Yjs state absence/uninitialized 시 DB Markdown fallback bootstrap.
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
- Source-of-truth rule: live Yjs provider state wins for active collaborative editing; DB
  Markdown projection must not overwrite live Yjs state without an explicit sync decision.
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
- DB stores a derived latest Markdown projection, not the live editing source of truth.
- Opening a document can bootstrap from DB Markdown only when live Yjs state is absent or
  uninitialized.
- Live Yjs state remains authoritative for active collaborative editing and reconnect merge.
- API/domain code does not import Yjs, Tiptap, Hocuspocus, ProseMirror, or browser editor types.
- Export and checkpoint creation use server-resolved current content, not untrusted full-body client snapshots.
- Product docs stay aligned with the server-resolved content/export/checkpoint contract.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck가 통과한다.
- 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- fallback bootstrap review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- code-quality review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/api typecheck`
- 기대 결과: API typecheck가 통과한다.
- 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- fallback bootstrap review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- code-quality review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: CE-01 and CE-05 e2e pass.
- 결과: 통과, 3 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- fallback bootstrap review 후 결과: 통과, 3 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- code-quality review 후 결과: 통과, 3 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- lint refactor 후 결과: 통과, 3 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).

추가 확인:

- 실행 명령: `pnpm --filter @rme/collab typecheck`
- 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- fallback bootstrap review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- code-quality review 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/web test`
- code-quality review 후 결과: 통과, 0 tests (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/api test`
- code-quality review 후 결과: 통과, 32 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm lint`
- lint refactor 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/web typecheck`
- lint refactor 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/api typecheck`
- lint refactor 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/collab typecheck`
- lint refactor 후 결과: 통과 (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).
- 실행 명령: `pnpm --filter @rme/api test`
- lint refactor 후 결과: 통과, 32 passed (`eval "$(fnm env)" && fnm use`, Node `v24.15.0`, pnpm `10.28.2`).

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: editor surface must stay editor-first and ADR-0007-aligned.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 메모

- This is the blocking content/serialization contract before downstream collab/editor product work.
- Fallback bootstrap review: DB fallback Markdown is exposed to the editor only after provider sync
  and is applied once through the Tiptap Markdown path when the collaboration editor is still empty.
- Code-quality review: deprecated collaboration checkpoint compatibility remains snapshot-backed only
  when the product current-content resolution flag is not set; product checkpoint creation explicitly
  resolves current content server-side.
- Lint refactor: split editor route-session/runtime helpers and collab runtime/client/store helpers
  without behavior changes.
- Follow-up/residual risk: canonical checkpoint frontend wiring lives in `apps/web/src/features/history`
  and `apps/web/src/lib/api-client`, outside this task write set, and should be aligned by a downstream
  task before relying on the product checkpoint UI path.
