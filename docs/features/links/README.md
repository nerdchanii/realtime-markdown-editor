# F-LINKS: Standard Markdown Links and Backlinks

## Purpose

Make documents connected while preserving standard Markdown portability. Document connections start from normal Markdown links rather than wikilink-only syntax.

## MVP Scope

- Recognize standard Markdown links to other documents.
- Show incoming backlinks or document connections for linked target documents.
- Keep link behavior compatible with Markdown source view and export.
- Treat wikilinks as a later enhancement.

## Out of Scope / Backlog

- Wikilink syntax as the primary document connection format.
- Graph view.
- Alias resolution and ambiguous title matching.
- Link suggestions powered by search ranking.

## Linked Requirement IDs

- `FR-08`
- `FR-09`
- `ARCH-09`
- `BL-04`

## Acceptance Summary

When one document links to another using standard Markdown link syntax, the target document exposes that incoming connection or backlink without requiring wikilink syntax.

## Open Questions / Research

- How document links identify targets: stable document IDs, relative paths, slugs, or mixed display text plus ID.
- Whether backlinks update immediately during editing or after save/checkpoint.
