---
title: docs/architecture/frontend.md
status: active
---

# docs/architecture/frontend.md

## 목적

Frontend architecture는 editor-first product experience를 유지한다. 사용자는 첫 화면에서 현재
워크스페이스, 문서, 계정, 협업 상태를 이해하고 곧바로 작성 흐름에 들어갈 수 있어야 한다.

## First Screen Rule

The first usable screen is the collaborative Markdown editor workspace, not a landing page or workflow dashboard. It keeps these surfaces discoverable in the same editor flow:

- shared Markdown editor,
- remote cursor and selection presence,
- offline/reconnect sync status,
- checkpoint/history inspector,
- Markdown rich or split preview,
- workspace/document context.

## Feature Boundaries

- `app` owns product bootstrapping, route-level state selection, and provider wiring.
- `layouts/workspace-shell` owns the editor-first shell composition, top bar chrome, docked pane
  layout, resize state, document tabs, and layout-only title/history preview state.
- `features/auth` owns product sign-in and account creation UI.
- `features/editor` owns TipTap rich Markdown authoring, presence-aware selection updates, and editor-local UI state.
- `features/document` owns document title, properties, state display/control, and document-scoped view model mapping.
- `features/history` owns checkpoint list and read-only snapshot inspection UI.
- `features/workspace` owns navigation projection UI for workspace/project/folder/document context.
- `features/settings` owns user, workspace, project settings panels and their API-backed mutations.
- `lib/api-client` owns calls to provider-neutral API contracts.

Frontend code must not import `apps/api/src/**`. Shared data shapes come from `packages/contracts` or feature-local view models.

Each feature exposes a public slot from its package root:

- `WorkspaceNavigationSlot` from `features/workspace`,
- `DocumentContextSlot` from `features/document`,
- `EditorWorkspaceSlot` from `features/editor`,
- `HistoryInspectorSlot` from `features/history`.

`App.tsx` passes product state to layout entry points and does not reach into feature subpaths.
Layout code composes feature slots through their public roots. Feature code may use its own internals,
but cross-feature imports must go through another feature's public root and must not import another
feature's subpath.

## Mock Replacement Points

The current product slice uses named mock providers only where integration tasks need replacement
points without moving UI ownership:

- `app.providers.mock` wires slot view models for the current app shell.
- `lib.api-client.mock` is the API client replacement point.
- `features.workspace.provider.mock` feeds workspace navigation.
- `features.document.provider.mock` feeds document context and properties.
- `features.editor.provider.mock` feeds editor mode, sync status, presence, source, and preview placeholders.
- `features.history.provider.mock` feeds checkpoint history.

## Product Experience Rule

Properties, links/backlinks, `DocumentState`, workspace navigation, account controls, and future
workflow controls support the editor-first flow. They are not decorative extensions when they make the
product understandable, trustworthy, or recoverable.

`DocumentState` controls are allowed as direct value/state changes in the current product slice.
Transition policy, publish/draft visibility, ownership-based visibility, and external workflow
execution are deferred until workflow capability promotion.

Frontend work should preserve the product context around the editor. The UI must make the current
workspace/document/member context visible enough for a user to understand where edits, presence,
history, export, and recovery belong.
