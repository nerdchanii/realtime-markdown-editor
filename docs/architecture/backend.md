---
title: docs/architecture/backend.md
status: active
---

# docs/architecture/backend.md

## 목적

Backend architecture는 CE-01부터 CE-05까지의 walking skeleton을 먼저 증명하면서 domain ownership이 흐려지지 않게 한다. 현재 기준은 TF architecture review의 결론처럼 `Workspace`, `Identity`, `Documents`, `Collaboration` capability를 최소 module skeleton으로 유지하는 것이다.

## Module Ownership

| Module | Ownership |
| --- | --- |
| `WorkspaceModule` | `Workspace`, `Project`, `Folder`, hidden root folder policy, folder lifecycle invariant |
| `IdentityModule` | `User`, `WorkspaceMembership`, membership display identity, role value |
| `DocumentsModule` | `Document`, body reference, `DocumentProperty`, `DocumentState`, checkpoint metadata use cases, CE-04 history read path |
| `CollaborationModule` | collaboration provider adapters, sync orchestration ports, artifact extraction/storage ports |
| `apps/collab` runtime | Hocuspocus/Yjs websocket runtime, live collaboration provider state, realtime adapter execution |

`HistoryModule`, workflow hooks module, and projection-only module are deferred. They must not become required walking-skeleton boundaries just because a file or empty module exists in current code.

## Dependency Direction

- Interfaces call application use cases.
- Use cases depend on same-module domain and ports.
- Adapters implement ports and stay outside domain.
- Cross-module communication goes through use cases, ports, or provider-neutral contracts.
- Domain files must not import provider SDKs, Nest decorators, browser APIs, editor internals, storage SDKs, or other module domain files.

The cross-module domain import ban is an enforcement target for dependency-cruiser and architecture checks. Adding the lint rule and cleaning current violations are implementation follow-ups, not part of this docs update.

## App-Private Domain

The first TypeScript monorepo keeps domain entities and values app-private under `apps/api/src/modules/**/domain`. Do not create `packages/domain`, `packages/application`, `packages/shared`, or shared domain/application utility packages for the walking skeleton.

`packages/contracts` is for provider-neutral HTTP/realtime wire contracts, including API request/response DTOs shared by frontend and backend. It must not expose backend domain internals as frontend view models.

## Product HTTP Route Ownership

`packages/contracts/src/http/routes.ts` is the canonical product API inventory for P10
implementation tasks. API controllers may split implementation by Nest module, but route
ownership follows the table below.

| Area | Canonical routes | Owner | Notes |
| --- | --- | --- | --- |
| Auth/session | `POST /auth/session`, `GET /auth/session`, `DELETE /auth/session` | `IdentityModule` | Current user and workspace membership come from the httpOnly session boundary. Product actions do not trust public `memberId` or `authorMembershipId` request fields. |
| Workspace/project/folder | `/workspaces`, `/workspaces/:workspaceId/navigation`, `/workspaces/:workspaceId/projects`, `/projects/:projectId`, `/folders`, `/folders/:folderId/*` | `WorkspaceModule` | Preserves hidden workspace/project root folder policy and root immutability. |
| Document metadata and properties | `/folders/:folderId/documents`, `/documents/:documentId`, `/documents/:documentId/move`, `/documents/:documentId/properties` | `DocumentsModule` | Every document has exactly one folder. Properties remain outside the Markdown body. |
| Current Markdown projection | `GET /documents/:documentId/content`, `PUT /documents/:documentId/content` | `DocumentsModule` | Stores the server-resolved portable Markdown projection used by export and checkpoint creation. |
| Links/backlinks | `GET /documents/:documentId/connections` | `DocumentsModule` | Projection read model derived from standard Markdown links. |
| Checkpoints/history | `GET /documents/:documentId/checkpoints`, `POST /documents/:documentId/checkpoints`, `GET /documents/checkpoints/:checkpointId/snapshot` | `DocumentsModule` | `POST /documents/:documentId/checkpoints` is the canonical checkpoint creation route. The server resolves current author membership and current Markdown content. |
| Markdown export | `POST /documents/:documentId/export` | `DocumentsModule` | The server resolves current Markdown body and properties, then returns frontmatter plus body as the portable file boundary. |
| Image upload | `POST /documents/:documentId/images` | `DocumentsModule` | Returns an editor-insertable image reference without exposing object-storage provider internals. |
| Collaboration session | `POST /documents/:documentId/collaboration-sessions` | `CollaborationModule` | Issues provider-neutral realtime session data. It must not create checkpoints or expose provider-specific Yjs/Hocuspocus state. |

The following routes are explicitly dev-only bootstrap routes and must not be required by the
normal product runtime path:

- `GET /review-context/seed`
- `GET /collaboration/sessions/seed`

The following existing routes are retired from the product contract:

- `GET /collaboration/documents/:documentId/session`, replaced by
  `POST /documents/:documentId/collaboration-sessions`
- `POST /collaboration/documents/:documentId/checkpoints`, replaced by
  `POST /documents/:documentId/checkpoints`

Collaboration route ownership does not include checkpoint creation. If a downstream task needs a
different checkpoint route, it must stop and route the contract change back through `TASK-071` or
the main orchestrator.

## HTTP DTO And Runtime Schema Strategy

`packages/contracts/src/http/index.ts` owns provider-neutral DTO names and shape. `packages/contracts/src/http/schemas.ts`
owns the runtime schema descriptor catalog and strategy. `TASK-073` implements the Nest runtime
validation, centralized CORS, and JSON error envelope from those descriptors.

Contract rules:

- DTOs are TypeScript wire contracts, not backend domain classes and not frontend view models.
- Runtime validation covers route params, query, body, and multipart metadata before use-case execution.
- Validation/auth/resource failures return `ApiErrorResponseDto` with stable `code`, `message`,
  optional `details`, and optional `requestId`.
- Public product request DTOs do not carry trusted `memberId` or `authorMembershipId` fields for
  product actions. The API derives membership from the session.
- Export and checkpoint creation do not accept arbitrary full-body client snapshots in the product
  contract. They resolve current Markdown content server-side from the document content projection
  and collaboration serialization boundary.

## Collaboration Runtime Topology

`apps/collab` is a separate workspace package and process. It owns Hocuspocus/Yjs server
dependencies and runtime execution. `apps/api` remains the provider-neutral HTTP/domain process:
it may issue session contracts, but it must not import Hocuspocus, Yjs, Tiptap, or ProseMirror
types into domain files.

The root development entrypoint starts API, collab, and web together. Individual scripts keep each
runtime startable for targeted debugging:

- `pnpm dev:api`
- `pnpm dev:collab`
- `pnpm dev:web`

## Deferred Promotion Triggers

Create a separate `HistoryModule` only when one of these becomes true:

- restore or branching becomes required behavior,
- history lifecycle or read/write SLA diverges from document use cases,
- retention or compliance needs independent ownership,
- checkpoint artifact inspect semantics need independent invariants.

Create a workflow capability or workflow executor only when `DocumentState` needs transition policy, external hook execution, ownership/visibility policy, or external reverse updates. Until then, `DocumentState` remains a value/state owned by `Document`.

Create a projection-only module only when query complexity, projection versioning, or conflict semantics no longer fit local read-model composition.
