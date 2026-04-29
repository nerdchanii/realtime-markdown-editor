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

## Deferred Promotion Triggers

Create a separate `HistoryModule` only when one of these becomes true:

- restore or branching becomes required behavior,
- history lifecycle or read/write SLA diverges from document use cases,
- retention or compliance needs independent ownership,
- checkpoint artifact inspect semantics need independent invariants.

Create a workflow capability or workflow executor only when `DocumentState` needs transition policy, external hook execution, ownership/visibility policy, or external reverse updates. Until then, `DocumentState` remains a value/state owned by `Document`.

Create a projection-only module only when query complexity, projection versioning, or conflict semantics no longer fit local read-model composition.
