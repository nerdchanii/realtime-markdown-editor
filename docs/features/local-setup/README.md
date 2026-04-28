# F-LOCAL-SETUP: Local Review and Submission

## Purpose

Make the project easy for a reviewer to run locally and understand without hidden context.

## MVP Scope

- Document install and run steps in the project README.
- Exclude dependency and build artifacts from submitted source.
- Explain seeded workspace, seeded users, and account switcher behavior.
- Explain selected free-area features and intentionally excluded backlog features in official docs.
- Keep official docs self-contained and independent of local scratch notes.

## Out of Scope / Backlog

- Hosted deployment automation.
- Production observability.
- CI/CD pipeline as a grading requirement unless later requested.

## Linked Requirement IDs

- `OPS-01`
- `OPS-02`
- `OPS-03`
- `NFR-03`
- `FR-03`

## Acceptance Summary

A reviewer can install dependencies, start the project, open the seeded workspace document, switch users, and understand why MVP features and backlog exclusions were chosen.

## Open Questions / Research

- Whether the final submission should include a scripted demo scenario in addition to README instructions.
- Which screenshots or short recordings are useful for grading, if any.
