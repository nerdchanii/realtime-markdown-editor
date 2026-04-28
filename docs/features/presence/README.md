# F-PRESENCE: Member Cursor and Selection Presence

## Purpose

Make collaboration visible by showing where other workspace members are currently editing or selecting text.

## MVP Scope

- Show remote member cursor position.
- Show remote member selection range when text is selected.
- Display member name and color from workspace membership.
- Update presence changes without manual refresh during the realtime editing demo.

## Out of Scope / Backlog

- Voice/video status.
- Typing indicators outside the editor.
- Follow-user mode or live viewport tracking.

## Linked Requirement IDs

- `CE-02`
- `FR-02`
- `UX-02`
- `NFR-02`

## Acceptance Summary

When one seeded member moves their cursor or selects text, another browser session sees that location or selection identified by the correct member name and color.

## Open Questions / Research

- Whether selection rendering should be identical in Rich, Markdown source, and Split modes.
- How to display presence when a member is in a different editor mode from the viewer.
