---
title: TASK-081-template-ui-absorption-undo-redo-image-insert
status: todo
phase: P10
task_type: parallel-ui
task_mode: parallel
owner: unassigned
depends_on:
  - TASK-076
  - TASK-079
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/components/ui/**
  - apps/web/src/styles/**
  - apps/web/src/lib/api-client/**
  - e2e/ce-01-concurrent-editing.spec.ts
  - e2e/ce-02-presence.spec.ts
  - e2e/ce-05-rich-preview.spec.ts
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
related_requirements:
  - CE-01
  - CE-02
  - CE-05
review_required: true
---

# TASK-081: Template UI Absorption, Undo/Redo, And Image Insert

## 목표

Useful Tiptap template UI를 product state ownership 없이 흡수하고 collaboration-safe undo/redo와 artifact-backed image insertion을 제공한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- UI 기준: `DESIGN.md`.
- editor decision: `docs/adr/0007-rich-markdown-authoring-surface.md`.
- dependencies: `TASK-076`, `TASK-079`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Dense workspace toolbar polish.
- Collaboration-safe undo/redo controls.
- Link, heading, list, task, code, image controls where supported.
- Image insertion through `TASK-079` artifact upload API.
- Preservation of real collaboration editor instance.

### 제외

- Raw Markdown source/split preview.
- Backend upload API implementation.
- Product state duplication in template UI.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks    | Notes                       |
| ---------- | ---------- | ---------------------- | ---------- | --------------------------- |
| `TASK-081` | `parallel` | `TASK-076`, `TASK-079` | `TASK-082` | editor UI product hardening |

- 안정 contract: `TASK-076` editor serialization and `TASK-079` image upload contract.
- mock 허용 여부: image insertion must use artifact API in product path.
- Image upload route source: `POST /documents/:documentId/images` from
  `packages/contracts/src/http/routes.ts`.
- Contract/API changes stop work and route to main orchestrator.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/components/ui/**`
- `apps/web/src/styles/**`
- `apps/web/src/lib/api-client/**`
- `e2e/ce-01-concurrent-editing.spec.ts`
- `e2e/ce-02-presence.spec.ts`
- `e2e/ce-05-rich-preview.spec.ts`

수정 금지:

- `.note/**`
- `apps/api/**`
- `apps/collab/**`

## 인수 조건

- Toolbar follows the dense workspace design in `DESIGN.md`.
- Undo/redo controls use collaboration-safe undo/redo, not default local history.
- Link, heading, list, task, code, and image controls are available where supported.
- Image insertion uses artifact upload API from `TASK-079`.
- The editor instance remains the real collaboration editor instance.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck가 통과한다.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: CE collaboration/rich editor e2e pass.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: editor instance remains the collaboration editor.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- `apps/web/src/lib/api-client/**` overlaps `TASK-080`; do not run these in parallel unless the phase agent narrows one write set first.
