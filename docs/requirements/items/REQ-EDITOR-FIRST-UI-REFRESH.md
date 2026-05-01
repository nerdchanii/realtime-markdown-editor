---
id: REQ-EDITOR-FIRST-UI-REFRESH
title: 제품 UI는 DESIGN.md 기준의 editor-first IDE-like workspace로 재정렬되어야 한다.
status: planned
category: product-extension
type: ux
priority: high
taskability: taskable
scope: frontend
derived_from:
  - DESIGN.md
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-WORKSPACE-HIERARCHY
depends_on:
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-WORKSPACE-HIERARCHY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-PRESENCE-MEMBER-AWARENESS
blocks: []
next_step: DESIGN.md를 source of truth로 삼아 Top Bar, Explorer, Editor, History inspector, Profile/Settings entry의 UI refresh task를 분리하되 deferred UI scope는 포함하지 않는다.
refs:
  - DESIGN.md
  - docs/product/README.md
  - docs/product/ui-capability-gap-log.md
  - docs/product/editor/presence.md
  - docs/product/editor/history.md
  - docs/product/workspace/workspace-hierarchy.md
  - docs/product/workspace/user-membership.md
---

# REQ-EDITOR-FIRST-UI-REFRESH

제품 UI는 개인 note app이나 card dashboard처럼 보이면 안 된다. `DESIGN.md`를 source of truth로 삼아
editor-first, IDE-like dense workspace로 재정렬해야 한다. 첫 화면의 중심은 collaborative TipTap editor이며,
workspace/project context, Explorer, History inspector, profile/settings entry는 editor 작업을 보조해야 한다.

Acceptance:

- Main workspace는 Top Bar, Explorer, center TipTap Editor, right History Inspector로 구성된 pane layout을 따른다.
- Center editor는 primary work surface로 유지되며 main editor body를 큰 rounded card로 감싸지 않는다.
- Top Bar는 workspace/project hierarchy, command/search, theme toggle, profile entry를 compact하게 제공한다.
- Settings는 standalone gear가 아니라 profile menu에서 진입하며 Workspace, Project, User scope로 분리된다.
- Right inspector는 first implementation에서 History 중심으로 유지되고 Document Details, Comments, Outline tab을 기본 노출하지 않는다.
- Document tabs, compact toolbar, document header metadata, saved/sync/offline state는 editor context 안에서 보인다.
- Presence는 editor surface 안에서만 보이고 remote caret/member label legibility requirement와 충돌하지 않는다.
- UI refresh는 existing CE-01 through CE-05 reviewer path를 숨기거나 대체하지 않는다.
- UI refresh는 existing product API와 client-side state contract를 사용하며 server/API/domain code를 수정하지 않는다.
- UI 구현 중 server capability gap이 발견되면 이 요구사항 안에서 고치지 않고 별도 backend requirement 또는 task로 분리한다.
- Backend/API/domain 기능이 아직 없더라도 제품 구조상 필요한 UI surface는 placeholder로 먼저 노출할 수 있다.
- Placeholder UI는 기능이 동작하는 것처럼 오해시키면 안 되며, missing capability를 `docs/product/ui-capability-gap-log.md`에
  기록해야 한다.

Explicit non-goals:

- Server-side API, domain model, persistence, authorization code를 수정하지 않는다.
- Raw Markdown source editor를 추가하지 않는다.
- Source/split preview mode를 추가하지 않는다.
- Comments, suggestions, chat, mentions, notifications, DMs를 추가하지 않는다.
- Outline inspector나 Document Details panel을 first implementation 기본 inspector로 추가하지 않는다.
- Global bottom status bar를 추가하지 않는다.
- Multi-pane document workspace를 추가하지 않는다.
- Public demo entrypoint, invitation inbox, workspace-wide offline cache는 이 요구사항의 범위가 아니다.
