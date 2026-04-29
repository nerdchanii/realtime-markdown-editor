---
title: docs/architecture/frontend.md
status: active
---

# docs/architecture/frontend.md

## 목적

Frontend architecture는 editor-first product experience를 유지한다. Product extensions can support the editor, but they must not hide or complicate the CE-01 through CE-05 reviewer path.

## First Screen Rule

The first usable screen is the collaborative Markdown editor workspace, not a landing page or workflow dashboard. It must keep these surfaces discoverable in the same review flow:

- shared Markdown editor,
- remote cursor and selection presence,
- offline/reconnect sync status,
- checkpoint/history inspector,
- Markdown rich or split preview,
- workspace/document context.

## Feature Boundaries

- `app` owns shell composition and route-level layout.
- `features/editor` owns Markdown authoring, mode controls, preview coordination, and editor-local UI state.
- `features/document` owns document title, properties, state display/control, and document-scoped view model mapping.
- `features/history` owns checkpoint list and read-only snapshot inspection UI.
- `features/workspace` owns navigation projection UI for workspace/project/folder/document context.
- `lib/api-client` owns calls to provider-neutral API contracts.

Frontend code must not import `apps/api/src/**`. Shared data shapes come from `packages/contracts` or feature-local view models.

## Product Extension Rule

Properties, links/backlinks, `DocumentState`, workspace navigation, and future workflow controls support the editor-first flow. They must not become the primary screen until CE-01 through CE-05 are stable and reviewable.

`DocumentState` controls are allowed as direct value/state changes in the walking skeleton. Transition policy, publish/draft visibility, ownership-based visibility, and external workflow execution are deferred until workflow capability promotion.
