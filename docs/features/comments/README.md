# F-COMMENTS: Collaboration Communication Backlog

## Purpose

Preserve comments, suggestions, mentions, notifications, quick chat, and direct messages as future collaboration capabilities without overloading the MVP.

## MVP Scope

- No MVP implementation.
- Document these capabilities as deferred or research-needed.
- Avoid designing MVP data models that assume comments or messages already exist.

## Out of Scope / Backlog

- Inline comments.
- Suggestions and review mode.
- Mentions and notifications.
- Quick chat.
- Direct messages.

## Linked Requirement IDs

- `RES-03`
- `BL-03`

## Acceptance Summary

Official docs classify comment, suggestion, mention, notification, chat, and DM features as outside MVP, with CRDT anchoring research required before implementation.

## Open Questions / Research

- How comment anchors behave when referenced text is deleted, moved, or merged.
- Whether communication should be document-scoped, workspace-scoped, or user-to-user.
- What stale-anchor policy is acceptable for reviewer-facing collaboration.
