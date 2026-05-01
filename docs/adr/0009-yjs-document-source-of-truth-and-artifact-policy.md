---
id: ADR-0009
title: "ADR-0009: 문서 편집 SOT는 Yjs로 두고 Postgres와 object storage는 projection과 artifact를 맡긴다"
status: proposed
date: 2026-05-01
authors:
  - nerdchanii
decision_type: architecture
tags:
  - collaboration
  - persistence
  - yjs
  - object-storage
  - checkpoint
  - projection
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - REQ-HISTORY-CHECKPOINTS
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
related_documents:
  - docs/adr/0002-collaboration-engine-poc-bench.md
  - docs/adr/0003-storage-strategy.md
  - docs/adr/0005-ui-shell-scope-model.md
  - docs/domain/models/document.md
  - docs/domain/models/document-property.md
  - docs/domain/models/checkpoint.md
  - docs/domain/rules/collaboration-boundaries.md
supersedes: []
superseded_by: null
---

# ADR-0009: 문서 편집 SOT는 Yjs로 두고 Postgres와 object storage는 projection과 artifact를 맡긴다

## 맥락

현재 제품은 Markdown body를 Yjs/Hocuspocus로 협업 편집하지만 title과 properties는 Postgres-backed
product API로 직접 갱신한다. 이 구조에서는 같은 문서를 열고 있는 사용자 사이에서 title이나
properties가 realtime으로 수렴하지 않고, 각 client의 local draft/projection override가 서로 다른
상태를 보여줄 수 있다.

또한 ADR-0003은 checkpoint Markdown snapshot artifact와 live Yjs binary persistence를 분리했지만,
문서의 editable metadata까지 협업 SOT로 다루는 정책은 명시하지 않았다. Title, properties,
DocumentState를 Markdown body와 분리하되 같은 collaborative document state 안에서 수렴시켜야 한다.

## 결정

문서의 현재 editable state는 Yjs document를 write source of truth로 둔다.

- Yjs document는 Markdown body뿐 아니라 document-scoped editable metadata를 포함한다.
  - Markdown body는 Yjs text field로 둔다.
  - Title, properties, 필요한 경우 DocumentState는 Markdown body 밖의 structured Yjs field로 둔다.
  - Exact Yjs field schema는 adapter implementation detail이지만, Markdown body text와 structured
    metadata는 서로 다른 field여야 한다.
- Postgres `documents`, `document_properties`, derived link edge, workspace navigation data는
  product read projection, indexing, authorization join, closed-document listing을 위한 저장소다.
  Postgres projection은 write SOT가 아니다.
- 열린 문서에서 title/properties/body를 변경할 때는 collaboration channel을 통해 Yjs state를 먼저
  변경한다. Client-local title override나 direct DB title mutation은 authoritative state로 쓰지 않는다.
- `PUT /documents/:documentId/content`, `PATCH /documents/:documentId` title update,
  `PUT /documents/:documentId/properties` 같은 direct projection write routes는 open-editor authoring
  path에서 deprecated다. 남겨야 한다면 migration/repair 또는 server-side closed-document Yjs mutation
  command의 projection update 단계로만 사용한다.
- 열려 있지 않은 문서를 product API로 변경해야 하는 경우에도 server-side Yjs document mutation을
  수행한 뒤 Postgres projection을 갱신한다. DB-only mutation은 migration 또는 repair 작업으로만
  제한하고 일반 product path로 사용하지 않는다.
- Markdown frontmatter는 export/import representation이다. Internal edit surface로 YAML
  frontmatter를 노출하지 않으며, properties UI가 structured property mutation surface다.

Checkpoint artifact는 MinIO/S3-compatible object storage에 immutable document snapshot으로 남긴다.

- Postgres는 checkpoint/revision metadata, artifact key, checksum, size, schema version, ownership
  reference만 저장한다.
- Canonical checkpoint artifact는 inspect/export에 필요한 structured snapshot manifest다.
- Restore/branching을 위해 checkpoint 시점의 compact Yjs binary state도 object artifact로 함께 남긴다.
- Checkpoint artifacts는 live Yjs compaction과 별도 retention boundary다. Live Yjs state를 compact하거나
  overwrite해도 checkpoint artifacts는 변경하지 않는다.

권장 object layout은 다음과 같다.

```text
workspaces/{workspaceId}/documents/{documentId}/checkpoints/{checkpointId}/snapshot.json
workspaces/{workspaceId}/documents/{documentId}/checkpoints/{checkpointId}/state.yjs
```

`snapshot.json`은 다음 값을 포함한다.

```json
{
  "schemaVersion": 1,
  "workspaceId": "workspace_...",
  "documentId": "document_...",
  "checkpointId": "checkpoint_...",
  "revisionId": "revision_...",
  "createdAt": "2026-05-01T00:00:00.000Z",
  "authorMembershipId": "member_...",
  "title": "Review Plan",
  "documentState": "review",
  "properties": [
    { "key": "Status", "value": { "type": "status", "value": "review" } }
  ],
  "markdownBody": "# Review Plan\n\n...",
  "yjsStateArtifactKey": "workspaces/.../checkpoints/.../state.yjs"
}
```

## FileSystem mental model

- Folder is a directory/container. Its hierarchy and lifecycle are Postgres source of truth.
- Document row is the file identity/inode and location. Creation, folder membership, archive/delete,
  and permissions are Postgres source of truth.
- Y.Doc is the file's current editable content state. Title, Markdown body, properties, and
  collaborative document metadata are Yjs source of truth after initialization.
- Postgres document fields are read projections for navigation, list/search, export, and fallback
  bootstrap.
- Checkpoint artifacts are immutable file snapshots stored behind the artifact storage boundary.

## 후보안

### 1. Yjs SOT + Postgres projection + object artifact

- 장점: 열린 문서의 body/title/properties가 같은 realtime convergence model을 따른다.
- 장점: workspace navigation, search, authorization, history list는 Postgres projection으로 빠르게 조회할 수 있다.
- 장점: checkpoint artifact는 live state compaction과 독립적으로 보존된다.
- 단점: projection updater와 server-side Yjs mutation path가 필요하다.
- 리스크: projection lag가 UI에서 authoritative state처럼 보이면 다시 split-brain이 생긴다.

### 2. Body만 Yjs SOT, title/properties는 Postgres SOT 유지

- 장점: 현재 구현에서 변경량이 작다.
- 단점: 열린 문서 metadata mutation이 realtime으로 수렴하지 않는다.
- 리스크: title/properties가 client별로 갈라지는 문제가 유지된다.

### 3. 모든 조회를 Yjs state에서 직접 수행

- 장점: projection lag가 없다.
- 단점: workspace navigation, list, search, authorization join이 비효율적이고 운영 복잡도가 커진다.
- 리스크: 문서를 열지 않은 list/read path가 collaboration provider state에 과하게 의존한다.

## 선택 근거

제품의 핵심은 collaborative Markdown-backed document다. 사용자가 문서를 열어 편집하는 동안에는
metadata도 body와 같은 협업 수렴성을 가져야 한다. 반면 workspace tree, 권한 검사, history list,
search/export 같은 read-heavy product path는 relational projection이 더 적합하다.

Object storage는 time-based Markdown cache를 만들기 위한 저장소가 아니다. Checkpoint는 사용자가
의도적으로 만든 retention boundary이며, artifact는 그 시점의 document snapshot을 보존한다. 따라서
주기적 Markdown cache는 만들지 않고, checkpoint artifact를 canonical historical snapshot으로 둔다.

## 결과

### 긍정적 영향

- 열린 문서에서 title, properties, body가 같은 Yjs convergence model을 따른다.
- Postgres row가 mutable source와 projection 역할을 동시에 하며 생기는 충돌을 줄인다.
- Checkpoint는 live Yjs compaction 이후에도 inspect와 restore 근거를 가진다.
- MinIO/S3-compatible storage boundary가 checkpoint/export/blob payload 저장소로 명확해진다.

### 부정적 영향 또는 트레이드오프

- Existing `documents.title`, `documents.markdownBody`, `document_properties` writes를 projection writes로
  재분류하고 mutation path를 고쳐야 한다.
- Closed-document mutation은 server-side Yjs load/mutate/store path가 필요하다.
- Checkpoint artifact format migration이 필요하다.
- Projection freshness와 conflict handling을 observable하게 만들어야 한다.

### 후속 작업

- Yjs document schema를 adapter 내부에 정의한다.
- Web document title/properties UI가 Yjs update path를 사용하도록 변경한다.
- Collab runtime store hook이 title/properties/body projection을 Postgres에 갱신하도록 확장한다.
- `PUT /documents/:documentId/content`와 direct title/properties projection write routes를 product
  authoring path에서 제거하거나 deprecated guard를 둔다.
- Closed-document product API mutation이 server-side Yjs mutation 후 projection을 갱신하도록 바꾼다.
- Local filesystem checkpoint artifact adapter를 MinIO/S3-compatible adapter로 교체한다.
- Checkpoint artifact를 `snapshot.json`과 `state.yjs`로 저장하고 inspect/export/restore candidate path를 갱신한다.
- Live Yjs compaction은 idle document에서만 실행하고 checkpoint artifacts를 변경하지 않도록 구현한다.

## 검증 방법

- Alice가 열린 문서 title을 변경하면 Bob의 title, tab label, workspace navigation projection이 manual
  reload 없이 수렴한다.
- Alice가 property를 변경하면 Bob의 properties UI와 export/checkpoint projection이 같은 값으로 수렴한다.
- Product API가 document detail/list를 조회할 때 Postgres projection을 사용하되, 열린 editor surface는
  Yjs state를 authoritative state로 표시한다.
- Checkpoint 생성 후 `snapshot.json`과 `state.yjs` object가 생성되고 DB에는 object key/checksum/size가 저장된다.
- Live Yjs state compaction 이후에도 기존 checkpoint snapshot inspect가 같은 title/properties/body를 반환한다.
- YAML frontmatter를 editor에서 직접 수정하지 않아도 Markdown export가 properties를 frontmatter로 포함한다.

## 관련 문서

- 요구사항: `REQ-PROPERTIES-OUTSIDE-BODY`, `REQ-MARKDOWN-EXPORT-FRONTMATTER`, `REQ-HISTORY-CHECKPOINTS`
- 제품 문서: `docs/product/editor/properties.md`, `docs/product/editor/history.md`, `docs/product/editor/markdown-export.md`
- 관련 ADR: ADR-0002, ADR-0003, ADR-0005

## 변경 이력

| 날짜       | 변경 내용 | 결정자     |
| ---------- | --------- | ---------- |
| 2026-05-01 | 최초 작성 | nerdchanii |
