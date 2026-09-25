---
title: docs/domain/rules/collaboration-boundaries.md
status: active
---

# docs/domain/rules/collaboration-boundaries.md

## 의존성 규칙

Domain과 product language는 collaboration provider API, storage SDK, browser API, desktop/PWA packaging API에 직접 의존하면 안 된다.

NestJS module은 DI와 composition을 위한 framework boundary다. `apps/api/src/modules/*/domain`에 Nest decorator, provider SDK, browser/editor/CRDT 타입이 들어가면 안 된다.

## 어댑터 경계

- Collaboration engine adapter: concurrent editing, awareness, provider state serialization을 담당한다.
- Live Yjs persistence adapter: open collaborative document reload/reconnect를 위한 provider binary state 저장과 재수화를 담당한다.
- Artifact storage adapter: S3-compatible object artifact operation을 담당한다.
- Local persistence adapter: browser-local document persistence를 담당한다.
- Notification adapter: Browser Notification API를 우선 쓰되 future native notification adapter를 열어둔다.
- Platform adapter: PWA/Tauri/Electron 가능성은 domain code 밖에 둔다.
- MCP server adapter: future agent integration surface이며 domain module이 아니다. MCP tools/resources는 application use case를 호출한다.

## 제공자 예시

- Yjs, Hocuspocus, Yorkie, ProseMirror, Tiptap은 implementation candidates이지 domain concepts가 아니다.
- S3, R2, MinIO는 object-storage-compatible boundary 뒤의 provider choices다.
- IndexedDB는 local persistence 뒤의 browser implementation detail이다.
- `apps/collab` filesystem Yjs persistence는 V1 local-compatible provider choice이며 product revision artifact store가 아니다.
- MCP protocol shape는 interface adapter concern이다.

## Runtime/package ownership

- `apps/collab` owns Hocuspocus/Yjs server dependencies and websocket runtime execution.
- `apps/web` owns editor integration, Hocuspocus provider, and browser Yjs client dependencies.
  - 현재 구현의 editor 는 Tiptap 이다.
  - (목표, ADR-0013) `markdown` 과 `code` 타입은 CodeMirror 6 로 편집한다.
- `apps/api` issues provider-neutral contracts and must not require Hocuspocus/Yjs/editor runtime packages in domain files.

## History Artifact 규칙

- User-visible checkpoint/revision history는 collaboration provider state를 직접 노출하지 않는다.
- Read-only history inspect path는 checkpoint metadata를 조회한 뒤 artifact storage adapter에서 Markdown snapshot을 읽어 반환한다.
- Live Yjs binary persistence는 open collaborative document reload/reconnect를 위한 provider state persistence이며 product revision snapshot artifact와 같은 DTO 또는 domain concept로 합치지 않는다.
- Live Yjs binary persistence provider는 local filesystem, memory, future durable provider로 교체 가능해야 하며 `apps/collab` adapter boundary 뒤에 둔다.
- 현재 제품 범위는 production S3/R2/MinIO setup을 필수 로컬 실행 조건으로 만들지 않는다. Local-compatible artifact adapter를 쓰더라도 provider 이름과 storage key format은 domain code에 새지 않아야 한다.
