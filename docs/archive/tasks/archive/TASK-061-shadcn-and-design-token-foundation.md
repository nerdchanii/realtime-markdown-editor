---
title: TASK-061-shadcn-and-design-token-foundation
status: archived
phase: P10
task_type: parallel-ui
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-060
write_set:
  - apps/web/package.json
  - package.json
  - pnpm-lock.yaml
  - apps/web/src/styles/**
  - apps/web/src/components/ui/**
  - apps/web/src/lib/utils.ts
  - components.json
  - apps/web/tailwind.config.*
  - tailwind.config.*
  - apps/web/src/app/**
  - apps/web/src/features/**/styles.ts
forbidden_paths:
  - .note/**
related_requirements:
  - CE-05-RICH-PREVIEW
review_required: true
---

# TASK-061: shadcn And Design Token Foundation

## 목표

Introduce shadcn UI primitives and map `DESIGN.md` into the web styling system without changing
CE reviewer selectors.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`,
  `docs/requirements/registry.md`.
- Visual source of truth: `DESIGN.md`.
- Recovery plan: `tasks/exec-plan/04-editor-ux-recovery.md`.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Add shadcn-compatible primitive components for button, input, tabs or toggle group, dialog,
  dropdown/menu, scroll area, badge, separator, and checkbox/switch if needed by properties.
- Add utility composition helper such as `cn` in `apps/web/src/lib/utils.ts`.
- Represent `DESIGN.md` colors, radii, spacing, typography, and focus ring as CSS variables or
  Tailwind-compatible tokens.
- Replace obvious ad hoc primitive styles where doing so does not alter feature behavior.

### 제외

- Tiptap editor implementation.
- Workspace CRUD behavior.
- History/properties redesign beyond primitive adoption.

## 계약과 의존성

| Task       | Mode          | Depends on | Unlocks                | Notes                           |
| ---------- | ------------- | ---------- | ---------------------- | ------------------------------- |
| `TASK-061` | `blocking-ui` | `TASK-060` | `TASK-064`, `TASK-065` | Primitive and token foundation. |

- 안정 contract: existing `data-testid` and ARIA labels used by CE e2e specs remain stable unless
  the same task updates matching tests.
- mock 허용 여부: not applicable.

## Write Set

수정 가능:

- `apps/web/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `apps/web/src/styles/**`
- `apps/web/src/components/ui/**`
- `apps/web/src/lib/utils.ts`
- Tailwind/shadcn config files if required.
- Existing feature style files only for token adoption.

수정 금지:

- `.note/**`
- Collaboration runtime behavior.

## 인수 조건

- shadcn primitives exist for button, input, tabs/toggle group, dialog, dropdown/menu, scroll area,
  badge, separator, and checkbox/switch if needed by properties.
- `DESIGN.md` colors are represented as CSS variables or Tailwind theme tokens.
- Primitive controls no longer rely on ad hoc inline styles when a local primitive is available.
- Existing CE selectors remain stable.

## 검증

- 실행 명령: `pnpm install` if dependencies change.
- 실행 명령: `pnpm --filter @rme/web typecheck`
- 실행 명령: `pnpm lint`
- 실행 명령: `pnpm format:check`
- 기대 결과: all commands pass.

## 검증 결과

- Dependency install was not required; no package dependency changes were made.
- `pnpm --filter @rme/web typecheck` -> passed.
- `pnpm lint` -> passed.
- `pnpm format:check` -> passed.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 해당 없음.
- Orchestration guardrail 확인: do not start until `TASK-060` baseline is accepted.

## Archive Checklist

- [x] `status`를 `archived`로 변경했다.
- [x] 파일을 `tasks/archive/`로 이동했다.
- [x] 검증 결과를 이 문서에 기록했다.
- [x] 필요한 공식 문서 업데이트를 완료했다.
- [x] follow-up 또는 blocker를 기록했다.
