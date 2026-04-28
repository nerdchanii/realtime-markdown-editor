# F-IDENTITY: Seeded Users and Workspace Membership

## Purpose

Provide a stable user model for collaboration without implementing full authentication. Presence, checkpoint authorship, and member properties should refer to users through workspace membership.

## MVP Scope

- Seed at least two users in the local environment.
- Provide an account switcher so reviewers can simulate multiple members.
- Represent each user's workspace membership with display name and color.
- Use membership identity for presence, checkpoint author, and member property fields.

## Out of Scope / Backlog

- Sign up, login, password reset, OAuth, SSO, and invite flows.
- Role-based access control beyond the minimum model needed for membership identity.
- Cross-workspace user administration.

## Linked Requirement IDs

- `CE-02`
- `FR-02`
- `FR-03`
- `FR-05`
- `UX-02`
- `OPS-02`

## Acceptance Summary

The reviewer can switch between at least two seeded users, open the same workspace document, and see distinct member names and colors reflected in presence and history.

## Open Questions / Research

- Whether the account switcher should live globally in the shell or inside the reviewer/demo controls.
- Which minimum membership fields are needed before permissions are introduced.
