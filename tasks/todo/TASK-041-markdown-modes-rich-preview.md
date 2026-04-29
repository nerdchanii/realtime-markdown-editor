---
title: TASK-041-markdown-modes-rich-preview
status: todo
phase: P6
task_type: feature
task_mode: parallel-ui
owner: unassigned
depends_on:
  - TASK-040
write_set:
  - apps/web/src/features/editor/**
  - apps/web/src/styles/**
  - apps/web/package.json
  - package.json
  - pnpm-lock.yaml
forbidden_paths:
  - .note/**
related_requirements:
  - CE-05
review_required: true
---

# TASK-041: Markdown Modes And Rich Preview

## 목표

Implement source, rich, rendered preview, and split mode.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`.
- 실행 계획: `tasks/exec-plan/03-product-surface-compliance.md`.
- product 기준: `docs/product/editor/rich-preview.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Rich, Markdown source, Preview, and Split mode switching.
- Rendered Markdown preview for headings, lists, tables, links, inline code, fenced code, task markers, and quotes.
- CE-05 targeted e2e pass.

### 제외

- Multi-document pane split.
- Wikilinks or graph view.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks    | Notes                      |
| ---------- | ------------- | ---------- | ---------- | -------------------------- |
| `TASK-041` | `parallel-ui` | `TASK-040` | `TASK-045` | Markdown modes and preview |

- 안정 contract: product surface contract from `TASK-040`.
- mock 허용 여부: UI mocks may remain only if CE-05 verifies product behavior.

## Write Set

수정 가능:

- `apps/web/src/features/editor/**`
- `apps/web/src/styles/**`
- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`

수정 금지:

- `.note/**`

## 인수 조건

- Reviewer can switch Rich, Markdown source, Preview, and Split modes.
- Split mode renders current Markdown beside source for one document.
- Heading, list, table, link, inline code, fenced code, task marker, and quote render without content loss.
- CE-05 e2e passes.

## 검증

- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm test:e2e e2e/ce-05-rich-preview.spec.ts`
- 기대 결과: all commands pass on Node `v24.15.0`.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: do not start before `TASK-040` is archived.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] follow-up 또는 blocker를 기록했다.

## 메모

- Parallel with `TASK-042`, `TASK-043`, and `TASK-044` after `TASK-040`.
