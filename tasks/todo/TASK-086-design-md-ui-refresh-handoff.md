---
title: TASK-086-design-md-ui-refresh-handoff
status: todo
phase: P11
task_type: parallel-ui
task_mode: parallel
owner: ui-agent
scope_note: intended for the separate UI agent
depends_on:
  - TASK-084
write_set:
  - DESIGN.md
  - docs/product/ui-capability-gap-log.md
  - apps/web/src/app/**
  - apps/web/src/features/editor/**
  - apps/web/src/features/workspace/**
  - apps/web/src/features/history/**
  - apps/web/src/styles/**
  - e2e/**
  - tasks/todo/TASK-086-design-md-ui-refresh-handoff.md
  - tasks/active/TASK-086-design-md-ui-refresh-handoff.md
  - tasks/archive/TASK-086-design-md-ui-refresh-handoff.md
forbidden_paths:
  - .note/**
  - apps/api/**
  - apps/collab/**
  - packages/**
  - apps/web/src/features/editor/adapters/tiptap-yjs-runtime.ts
  - apps/web/src/features/editor/adapters/tiptap-yjs-collaboration-adapter.ts
  - apps/web/src/features/editor/adapters/tiptap-yjs-sync-status.ts
  - apps/web/src/features/editor/adapters/indexeddb-offline-draft-persistence.ts
related_requirements:
  - REQ-EDITOR-FIRST-UI-REFRESH
  - REQ-PRESENCE-CARET-LABEL-LEGIBILITY
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-LIFECYCLE-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
review_required: true
---

# TASK-086: DESIGN.md UI Refresh Handoff

## 목표

`DESIGN.md`를 source of truth로 삼아 editor-first IDE-like workspace UI를 크게 정리한다.

## 배경

- UI update는 별도 UI agent가 수행할 예정이다.
- 현재 가장 큰 제품 인상 문제는 shell density, editor-first hierarchy, profile/settings IA, history-only inspector,
  presence legibility, sync/offline state placement이다.
- `TASK-084`는 IndexedDB/Yjs adapter internals를 다루므로 UI agent는 해당 파일을 피한다.
- 이 task는 frontend-only UI refresh다. Server/API/domain/persistence/authorization code는 수정하지 않는다.

## 범위

### 포함

- Compact top bar: `Workspace > Project`, command/search, theme toggle, profile.
- IDE-like Explorer, center TipTap editor, right History inspector.
- Document tabs, compact toolbar, document header metadata chips.
- Profile menu and settings entry consistent with `TASK-085`.
- Presence caret/name label polish if it does not conflict with collaboration adapter internals.
- Remove dashboard/card-heavy visual patterns that conflict with `DESIGN.md`.
- Product 구조상 필요하지만 아직 기능이 없는 surface는 honest placeholder로 먼저 구현한다.
- Missing backend/API/domain capability는 `docs/product/ui-capability-gap-log.md`에 follow-up owner와 함께 기록한다.
- Existing product API와 client-side state contract만 사용한다.

### 제외

- Raw Markdown source mode.
- Split preview mode.
- Comments/outline inspector.
- Global bottom status bar.
- Workspace-wide offline cache.
- IndexedDB/Yjs persistence implementation.
- Server-side API, domain model, persistence, authorization changes.
- Backend capability gap 해결. gap은 별도 backend requirement/task로 분리한다.

## 인수 조건

- Main workspace follows `DESIGN.md` pane layout rather than card dashboard layout.
- Editor remains the primary work surface.
- History inspector is history-only for first implementation.
- Settings entry comes through profile menu and can route to Workspace, Project, User sections or a scoped placeholder if backend is not ready.
- Placeholder UI clearly communicates unavailable capability and does not pretend to save, mutate, invite, delete, or authorize anything.
- Each missing capability exposed by the UI is recorded in `docs/product/ui-capability-gap-log.md` with an owner requirement or task candidate.
- Presence caret is visually legible and member label appears without becoming Markdown content.
- UI does not touch forbidden collaboration adapter internals owned by `TASK-084`.
- UI refresh does not modify server/API/domain code.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck passes.
- 실행 명령: relevant web tests or e2e smoke selected by changed surfaces
- 기대 결과: workspace opens, editor renders, history remains accessible, profile/settings menu works.
- 실행 명령: manual visual smoke against `DESIGN.md`
- 기대 결과: no global bottom status bar, no rounded-card shell, no top-bar presence avatars, no raw/split preview mode.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Visual/design review 필요 여부: 필요.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
