# F-I18N: Korean and English UI Resources

## Purpose

Support Korean and English user interfaces from the beginning so product language does not become hard-coded into the UI.

## MVP Scope

- Provide ko/en resources for main navigation, editor shell, properties, history, offline status, and reviewer-facing controls.
- Keep feature labels and status text routed through an i18n resource structure.
- Let the app select or switch locale in a simple way suitable for local review.

## Out of Scope / Backlog

- Full localization workflow with translation management.
- Per-user persisted locale preferences across devices.
- Pluralization and locale-specific formatting beyond basic MVP needs.

## Linked Requirement IDs

- `UX-08`

## Acceptance Summary

Primary app shell text can be displayed in Korean and English without editing source code strings in component bodies.

## Open Questions / Research

- Whether locale switching is exposed as a visible control in MVP or configured through seeded user/demo settings.
- Which date and time formats should be used for checkpoint history in each locale.
