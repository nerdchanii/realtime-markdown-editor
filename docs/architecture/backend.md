---
title: docs/architecture/backend.md
status: active
---

# docs/architecture/backend.md

## 목적

Backend architecture는 `Workspace`, `Identity`, `Documents`, `Collaboration` capability가 신뢰 가능한
product boundary로 동작하도록 유지한다.

## Module Ownership

| Module                | Ownership                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `WorkspaceModule`     | `Workspace`, `Project`, `Folder`, hidden root folder policy, folder lifecycle invariant                                 |
| `IdentityModule`      | `User`, `WorkspaceMembership`, membership display identity, role value                                                  |
| `DocumentsModule`     | `Document`, body reference, `DocumentProperty`, `DocumentState`, checkpoint metadata use cases, history read path       |
| `CollaborationModule` | collaboration provider adapters, sync orchestration ports, artifact extraction/storage ports                            |
| `apps/collab` runtime | Hocuspocus/Yjs websocket runtime, live collaboration provider state, realtime adapter execution                         |

`HistoryModule` and projection-only module are deferred. The workflow capability is accepted by ADR-0017 but not implemented yet. They must not become
required boundaries just because a file or empty module exists in current code. Deferral does not
apply to auth, authorization, persistence integrity, or runtime validation required for current
product routes.

## Dependency Direction

- Interfaces call application use cases.
- Use cases depend on same-module domain and ports.
- Adapters implement ports and stay outside domain.
- Cross-module communication goes through use cases, ports, or provider-neutral contracts.
- Domain files must not import provider SDKs, Nest decorators, browser APIs, editor internals, storage SDKs, or other module domain files.

The cross-module domain import ban is an enforcement target for dependency-cruiser and architecture checks. Adding the lint rule and cleaning current violations are implementation follow-ups, not part of this docs update.

## App-Private Domain

The TypeScript monorepo keeps domain entities and values app-private under
`apps/api/src/modules/**/domain`. Do not create `packages/domain`, `packages/application`,
`packages/shared`, or shared domain/application utility packages until a concrete product boundary
requires that promotion.

`packages/contracts` is for provider-neutral HTTP/realtime wire contracts, including API request/response DTOs shared by frontend and backend. It must not expose backend domain internals as frontend view models.

## Product HTTP Route Ownership

`packages/contracts/src/http/routes.ts` is the canonical product API inventory for P10
implementation tasks. API controllers may split implementation by Nest module, but route
ownership follows the table below.

| Area                             | Canonical routes                                                                                                                                      | Owner                 | Notes                                                                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth/session                     | `POST /auth/session`, `GET /auth/session`, `DELETE /auth/session`                                                                                     | `IdentityModule`      | Current user and workspace membership come from the httpOnly session boundary. Password credentials are verified server-side. Product actions do not trust public `memberId` or `authorMembershipId` request fields.         |
| Workspace/project/folder         | `/workspaces`, `/workspaces/:workspaceId/navigation`, `/workspaces/:workspaceId/projects`, `/projects/:projectId`, `/folders`, `/folders/:folderId/*` | `WorkspaceModule`     | Preserves hidden workspace/project root folder policy and root immutability.                                                                                                                                                 |
| Document metadata and properties | `/folders/:folderId/documents`, `/documents/:documentId`, `/documents/:documentId/move`, `/documents/:documentId/properties`                          | `DocumentsModule`     | Every document has exactly one folder. Properties remain outside the Markdown body.                                                                                                                                          |
| Current Markdown projection      | `GET /documents/:documentId/content`, `PUT /documents/:documentId/content`                                                                            | `DocumentsModule`     | Stores the server-resolved portable Markdown projection derived from the live collaboration document. It is used by export, checkpoint creation, and fallback bootstrap only when live Yjs state is absent or uninitialized. |
| Links/backlinks                  | `GET /documents/:documentId/connections`                                                                                                              | `DocumentsModule`     | Projection read model derived from standard Markdown links.                                                                                                                                                                  |
| Checkpoints/history              | `GET /documents/:documentId/checkpoints`, `POST /documents/:documentId/checkpoints`, `GET /documents/checkpoints/:checkpointId/snapshot`              | `DocumentsModule`     | `POST /documents/:documentId/checkpoints` is the canonical checkpoint creation route. The server resolves current author membership and current Markdown content.                                                            |
| Markdown export                  | `POST /documents/:documentId/export`                                                                                                                  | `DocumentsModule`     | The server resolves current Markdown body and properties, then returns frontmatter plus body as the portable file boundary.                                                                                                  |
| Image upload                     | `POST /documents/:documentId/images`                                                                                                                  | `DocumentsModule`     | Returns an editor-insertable image reference without exposing object-storage provider internals.                                                                                                                             |
| Collaboration session            | `POST /documents/:documentId/collaboration-sessions`                                                                                                  | `CollaborationModule` | Issues provider-neutral realtime session data and a short-TTL signed connection token (`connection`). It must not create checkpoints or expose provider-specific Yjs/Hocuspocus state. |

The following existing routes are retired from the product contract:

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

## Product API Boundary

Product routes keep account, workspace, document, and collaboration data behind explicit API
boundaries:

- Public routes are limited to credential/session bootstrap and explicitly documented public reads.
- Workspace, document, checkpoint, export, image, and collaboration session routes derive access from
  the current session and workspace membership.
- Runtime validation rejects malformed input before use-case execution.
- Missing infrastructure configuration should fail during startup or preflight when practical, not as
  opaque request-time 500s.
- Service-internal routes must be identified as service-internal and protected before being treated as
  product-ready.

## Collaboration Runtime Topology

`apps/collab` is a separate workspace package and process. It owns Hocuspocus/Yjs server
dependencies and runtime execution. Live Yjs provider state is the authoritative state for active
collaborative editing and reconnect merge. The current Markdown body in the database is a derived
portable projection, not the live editing source of truth.

The collab runtime stores live Yjs updates first. After a Yjs store event, it may update
`PUT /documents/:documentId/content` with the latest Markdown projection serialized by the editor
Markdown bridge. When a live Yjs snapshot exists, that snapshot wins. The DB Markdown body may
bootstrap a collaboration document only when the live Yjs snapshot is absent or uninitialized.

`apps/api` remains the provider-neutral HTTP/domain process: it may issue session contracts and
store the derived projection, but it must not import Hocuspocus, Yjs, Tiptap, or ProseMirror types
into document domain files.

The root development entrypoint starts API, collab, and web together. Individual scripts keep each
runtime startable for targeted debugging:

- `pnpm dev:api`
- `pnpm dev:collab`
- `pnpm dev:web`

### 협업 연결 인증 (ADR-0012 §1)

collab 서버는 API 가 발급한 협업 연결 token 을 검증한 연결에만 문서를 연다.

- **발급**: `POST /documents/:documentId/collaboration-sessions`
  - API 는 session cookie 에서 요청 문서가 속한 workspace 의 멤버십을 고른다. 암묵적인 첫 번째 멤버십은 쓰지 않는다.
  - `authorize(actor, action, resource)` policy(`modules/identity/domain/authorization-policy.ts`)로 접근 수준을 정한다.
    - `content.write` 가 허용되면 `write`, `content.read` 만 허용되면 `read` 다.
    - viewer 와 archived 문서는 `read` 다. 둘 다 허용되지 않으면 403 이고 token 을 만들지 않는다.
  - 응답의 `connection` 에 `token`, `expiresAt`, `access` 를 싣는다.
- **token**: HS256 JWT 다. `RME_COLLAB_TOKEN_SECRET` 으로 서명하고 API 와 collab 이 이 값을 공유한다.
  - 대칭 서명을 쓰는 이유: 협업 token 을 검증하는 곳은 collab 하나뿐이다. collab 밖에서 검증해야 하면 비대칭 키로 바꾼다.
  - claim 은 문서(`documentId`, `documentKey`), principal(`sub`, `principalKind`, `membershipId`, `workspaceId`), `access`, `iat`, `exp` 다.
  - TTL 기본값은 120초이고 `RME_COLLAB_TOKEN_TTL_SECONDS` 로 바꿀 수 있다(최대 900초).
- **검증**: collab 의 Hocuspocus `onAuthenticate`(`apps/collab/src/auth/`)
  - 서명, 발급자와 대상, 만료, 문서 범위(`documentKey` 와 연결한 문서 이름이 같은지)를 확인한다.
  - 실패하면 연결을 거부한다(permission-denied). token 이 없는 연결도 거부한다.
  - `read` token 은 read-only 연결로 연다. 서버는 그 연결의 문서 변경을 적용하지 않는다.
  - 연결 context 의 principal 은 token 에서 온다. 아직 이 principal 을 쓰는 hook 은 없다.
  - presence(awareness) 신원은 여전히 client 가 싣는다. 서버 강제는 아래 "아직 없는 것"의 후속 작업이다.
- **설정이 없을 때**: `RME_COLLAB_TOKEN_SECRET` 이 없거나 32자보다 짧으면 API 와 collab 모두 시작하지 않는다.
  `pnpm dev` 는 값이 없으면 실행마다 임의 값을 만들어 두 프로세스에 넘긴다.
- **아직 없는 것** (ADR-0012 에서 결정됨, 다음 작업)
  - 연결 중 권한 회수 시 연결 끊기와 token 갱신 때 policy 재판정
  - internal API(`/collaboration/internal/*`) 서비스 인증
  - presence(awareness) 신원을 token principal 로 강제하기

## Deferred Promotion Triggers

Create a separate `HistoryModule` only when one of these becomes true:

- restore or branching becomes required behavior,
- history lifecycle or read/write SLA diverges from document use cases,
- retention or compliance needs independent ownership,
- checkpoint artifact inspect semantics need independent invariants.

(목표, [ADR-0017](../adr/0017-document-workflow-triggers-and-executor.md) accepted, 아직 구현 전) 워크플로우 capability 와 실행기는 더 이상 보류가 아니다.

- `DocumentState` 는 `Document` 가 가진 value/state 로 남는다. 변경은 `ChangeDocumentState` use case 로만 한다.
  - server 범위: `authorize(actor, "document.state.change", document)` 와 workspace 의 전환별 guard 를 판정한다. 상태 변경과 outbox 이벤트를 한 DB 트랜잭션으로 커밋한다.
  - local 범위: 같은 use case 를 local 저장 adapter 로 실행한다. 권한은 항상 허용이고 outbox 는 없다.
- 커밋 뒤 outbox relay 가 이벤트를 실행기와 `apps/collab` 에 전달한다. `apps/collab` 은 연결된 클라이언트에게 stateless 알림을 보낸다.
- 워크플로우 실행기는 `apps/api`, `apps/collab` 과 나란히 별도 프로세스로 배포한다(앱 이름 초안 `apps/workflow`).
  - 전달은 최소 한 번이고, 이벤트 id 로 중복 실행을 막는다.
  - 실행기는 서비스 자격증명으로 인증한다. 동작마다 `{ principal: 에이전트, onBehalfOf: owner }` actor 로 policy 판정을 받는다. 실행기에게 넓은 권한을 따로 주지 않는다.
  - 에이전트 동작은 ADR-0016 의 문서 연산 use case 를 부른다.
- Workflow 설정과 실행 기록의 모델은 `docs/domain/models/workflow.md` 에 있다.

Create a projection-only module only when query complexity, projection versioning, or conflict semantics no longer fit local read-model composition.
