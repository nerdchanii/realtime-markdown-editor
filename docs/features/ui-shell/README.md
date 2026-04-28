# F-UI-SHELL: 3-Panel Product Shell

## Purpose

Present the editor as a focused B2B workspace tool with predictable navigation, editing, and inspection zones.

## MVP Scope

- Use a foldable left panel for workspace, project, folder, and document navigation.
- Use the center area for document title, properties, editor, mode switcher, and editor rail.
- Use a foldable right inspector for selected document, workspace, user, or editor context.
- Provide a table-of-contents rail near the editor for heading navigation.
- Surface online/offline/sync state in the shell.

## Out of Scope / Backlog

- Mobile-first navigation.
- Complex dashboard or analytics pages.
- Highly customizable layouts.
- Plugin panels.

## Linked Requirement IDs

- `FR-12`
- `FR-07`
- `UX-01`
- `UX-03`
- `UX-04`
- `UX-05`
- `UX-06`
- `UX-07`
- `UX-08`

## Acceptance Summary

The reviewer sees a 3-panel app shell with collapsible sides. The center editor remains the primary work area, properties sit near the title, and the right inspector changes according to context.

## Open Questions / Research

- Which inspector contexts are required in MVP versus represented as empty shell states.
- How the ToC rail behaves in Rich, Markdown source, and Split modes.
