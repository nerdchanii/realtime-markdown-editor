---
title: TASK-081-template-ui-absorption-undo-redo-image-insert
status: archived
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

- Dense workspace toolbar controls that preserve the editor-first product layout.
- Collaboration-safe undo/redo controls.
- Link, heading, list, task, code, image controls where supported.
- Image insertion through `TASK-079` artifact upload API.
- Preservation of real collaboration editor instance.

### 제외

- Raw Markdown source/split preview.
- Backend upload API implementation.
- Product state duplication in template UI.
- Broad visual redesign or evaluation-harness UI.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks    | Notes                       |
| ---------- | ---------- | ---------------------- | ---------- | --------------------------- |
| `TASK-081` | `parallel` | `TASK-076`, `TASK-079` | `TASK-082` | editor UI product hardening |

- 안정 contract: `TASK-076` editor serialization and `TASK-079` image upload contract.
- mock 허용 여부: image insertion must use artifact API in product path.
- Image upload route source: `POST /documents/:documentId/images` from
  `packages/contracts/src/http/routes.ts`.
- `TASK-080` owns general product API migration. `TASK-081` may touch API client code only for
  image insertion and editor-control needs that are not already covered by `TASK-080`.
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
- Normal UI presents editor/product controls, not evaluation-harness artifacts.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 결과: 통과. Node `v24.15.0`, pnpm `10.28.2`.
- 실행 명령: `pnpm test:e2e e2e/ce-01-concurrent-editing.spec.ts e2e/ce-02-presence.spec.ts e2e/ce-05-rich-preview.spec.ts`
- 결과: 통과. 7 passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: editor instance remains the collaboration editor.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.

## 완료 메모

- Toolbar는 editor-first layout 안에서 rough functional dense controls로 흡수했다.
- Undo/redo는 default local history extension이 꺼진 실제 collaboration editor command path를 사용한다.
- Image insertion은 `POST /documents/:documentId/images` artifact upload API를 사용한다.
- Image insertion e2e는 visible alt text뿐 아니라 Markdown export에 `rme-artifact://...` reference가 보존되는지 검증한다.
- Undo/redo e2e는 marker attribute뿐 아니라 collaboration-backed routed editor에서 실제 edit -> undo -> redo content 변화를 검증한다.
- Checkpoint API client는 retired collaboration checkpoint route 대신 canonical `POST /documents/:documentId/checkpoints`와 `credentials: "include"`를 사용한다.
- 초기 구현에서 editor instance를 React state로 끌어올려 collaboration bootstrap 중 추가 render가 발생했고 CE-01 sync가 pending에 머무는 회귀가 있었다. 최종 구현은 ref bridge로 toolbar가 같은 editor instance를 참조하되 collaboration subtree를 재렌더하지 않는다.
- Blocker 없음.

## 메모

- `apps/web/src/lib/api-client/**` overlaps `TASK-080`; do not run these in parallel unless the phase agent narrows one write set first.
