# @rme/contracts

`@rme/contracts` owns DTO and realtime payload shapes shared by API, web, and e2e code.

## Boundary Rules

- Do not import `apps/**` source from this package.
- Do not expose backend domain entities as DTOs.
- API interface adapters must map domain/application results into these DTOs explicitly.
- Web code may mock these DTOs for UI work, but integration tasks must replace mocks through API/realtime clients.
- Autosave, revision, publication, and sync status are separate concepts and must not be collapsed into one field.

## Current Contract Areas

- Local sample workspace context.
- Workspace, project, folder, user, and workspace membership identity.
- Document summary/detail and properties.
- Collaboration session and realtime awareness payloads.
- Artifact references for autosave and revision snapshots.
- Checkpoint, revision, and publication metadata.
