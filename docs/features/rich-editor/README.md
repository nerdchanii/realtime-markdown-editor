# F-RICH-EDITOR: Rich, Markdown Source, and Split Editing

## Purpose

Make Markdown authoring comfortable for both WYSIWYG-style editing and source-level inspection while satisfying rich preview requirements.

## MVP Scope

- Open documents in Rich mode by default.
- Provide Markdown source mode.
- Provide Split mode with editor and rendered preview visible together.
- Preserve document content when switching modes.
- Expose a clear mode switcher for Rich, Markdown source, and Split.

## Out of Scope / Backlog

- Advanced block database editing.
- Custom markdown extensions that cannot round-trip through standard Markdown.
- Multi-pane editing beyond the MVP Split mode.

## Linked Requirement IDs

- `CE-05`
- `FR-04`
- `UX-09`
- `ARCH-03`
- `RES-01`

## Acceptance Summary

The reviewer can switch between Rich, Markdown source, and Split modes without content loss. Split mode shows the rendered Markdown preview for the current document.

## Open Questions / Research

- Final editor stack depends on the collaboration engine POC.
- Round-trip quality between Rich editing and standard Markdown export needs explicit validation.
