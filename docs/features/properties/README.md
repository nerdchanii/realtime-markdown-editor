# F-PROPERTIES: Document Properties Outside Markdown Body

## Purpose

Support structured document metadata without polluting the Markdown body. Properties should be visible and editable near the document title.

## MVP Scope

- Store document properties separately from Markdown body content.
- Place property editing near the document title.
- Support basic property types such as text, select/status, date, member, and checkbox.
- Allow member properties to reference workspace membership.
- Keep body source and export free from inline property values unless export policy later chooses otherwise.

## Out of Scope / Backlog

- Property templates.
- Property inheritance across workspace, project, folder, and document.
- Formula, relation, rollup, and database-style properties.

## Linked Requirement IDs

- `FR-07`
- `FR-10`
- `UX-05`
- `ARCH-07`
- `RES-04`
- `BL-06`

## Acceptance Summary

The reviewer can edit document metadata near the title. Switching to Markdown source does not insert those property values into the document body.

## Open Questions / Research

- Which property types are mandatory for the first MVP cut if implementation time is constrained.
- Whether Markdown export should include properties as front matter, a separate artifact, or omit them.
