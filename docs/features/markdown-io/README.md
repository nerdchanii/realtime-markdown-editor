# F-MARKDOWN-IO: Markdown Source and Export

## Purpose

Keep Markdown as the portable document format for source inspection and export, even while the product offers Rich editing and structured metadata.

## MVP Scope

- Provide Markdown source view for the document body.
- Provide standard Markdown export for document body and links.
- Ensure Rich and Split modes do not require non-portable syntax for core content.
- Keep document properties separate from body source.

## Out of Scope / Backlog

- Export to PDF, DOCX, HTML bundles, or static websites.
- Custom Markdown syntax that standard tools cannot parse.
- Lossless export of every future structured property or collaboration annotation.

## Linked Requirement IDs

- `CE-05`
- `FR-04`
- `FR-08`
- `FR-09`
- `UX-09`
- `ARCH-07`
- `ARCH-09`

## Acceptance Summary

The reviewer can inspect Markdown source and export a document as standard Markdown. Links remain readable by normal Markdown tools, and body-external properties do not unexpectedly appear inside the body.

## Open Questions / Research

- Whether exported Markdown should optionally include properties as front matter.
- What exact Markdown subset or extensions are allowed for the first implementation.
