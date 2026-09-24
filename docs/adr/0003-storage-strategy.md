---
id: ADR-0003
title: "ADR-0003: 저장소 역할은 RDB, S3-compatible object storage, 선택적 realtime support로 분리한다"
status: accepted
date: 2026-04-28
authors:
  - nerdchanii
decision_type: architecture
tags:
  - storage
  - revision
  - persistence
  - object-storage
related_requirements:
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-HISTORY-CHECKPOINTS
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
  - REQ-RESEARCH-REDIS-SUPPORT
  - REQ-PLATFORM-PORTABILITY-GUARDRAIL
related_documents:
  - subject.md
  - ARCHITECTURE.md
  - docs/domain/rules/collaboration-boundaries.md
supersedes: []
superseded_by: null
---

# ADR-0003: 저장소 역할은 RDB, S3-compatible object storage, 선택적 realtime support로 분리한다

## 맥락

제품은 workspace/document metadata, collaboration document artifacts, checkpoint snapshots, export artifacts, user-uploaded blobs, presence, local offline state를 다룬다. 이 데이터들은 수명과 접근 패턴이 다르다.

사용자가 올리는 blob과 `collabDoc`/revision artifact를 관리하려면 object storage 계층을 전제로 두는 것이 자연스럽다. 다만 처음부터 운영형 S3/R2 배포를 붙이는 것은 과제 범위를 키울 수 있으므로 provider 선택과 storage boundary를 분리해야 한다.

## 결정

저장소 역할을 다음처럼 분리한다.

- RDB/Postgres: workspace, project, folder, document, membership, properties, link edge, checkpoint metadata를 저장한다.
- S3-compatible object storage: checkpoint snapshot, export artifact, user-uploaded blob, large collaboration document artifact를 저장한다.
- MinIO: local/dev에서 S3-compatible boundary를 재현하는 provider 후보.
- S3/R2: future deployment provider 후보.
- Redis: durable store가 아니라 presence, pub/sub, cache, queue 같은 optional support 후보.
- IndexedDB/local persistence: open-page offline editing을 위한 browser-local document persistence adapter.
- Local filesystem live Yjs persistence: V1 local/dev에서 Hocuspocus/Yjs provider state를 binary update로 저장/재수화하는 swappable adapter provider.

여기서 `artifact`, `collaboration document artifact`는 storage/infrastructure payload를 가리키는 용어다. 이는 domain object classification의 `CollaborationArtifact`를 도메인 객체로 승격한다는 뜻이 아니며, artifact format과 provider-specific serialized state는 adapter/infrastructure boundary 뒤에 둔다.

V1 CE skeleton에서는 checkpoint snapshot artifact를 inspectable Markdown snapshot과 artifact metadata로 정의한다. Read-only snapshot inspect path는 checkpoint/revision metadata를 조회한 뒤 artifact boundary에서 Markdown snapshot을 읽어 반환한다.

Live Yjs binary persistence와 product revision snapshot artifact는 서로 다른 저장 책임이다. Hocuspocus/Yjs persistence는 열린 collaborative document의 provider state 재수화에만 사용하고, user-visible checkpoint/revision history는 product metadata와 snapshot artifact boundary로 관리한다. V1 local-compatible provider는 filesystem-backed Yjs update 저장소이며, 동일한 `apps/collab` adapter port 뒤에서 memory, database, object storage backed provider로 교체할 수 있어야 한다.

V1 CE skeleton의 local review는 production S3/R2/MinIO 구성을 요구하지 않는다. 구현은 S3-compatible adapter port를 유지하되, filesystem 또는 in-memory 같은 local-compatible artifact adapter로 checkpoint Markdown snapshot을 저장하고 inspect path를 검증할 수 있다.

## 후보안

### 1. RDB + S3-compatible object storage + optional realtime support

- 장점: metadata, artifact, transient state의 책임이 분리된다.
- 단점: local setup 설명이 늘어날 수 있다.
- 리스크: 과제 범위에 비해 storage infra가 커질 수 있다.

V1 skeleton에서는 이 후보를 adapter boundary로 채택하되 production object storage provider를 필수 실행 조건으로 만들지 않는다.

### 2. RDB 단일 저장소

- 장점: 초기 실행이 단순하다.
- 단점: blob과 large artifact 책임이 불명확하다.
- 리스크: revision artifact와 domain metadata가 섞인다.

### 3. 협업 엔진 저장소에 모두 위임

- 장점: provider 예제를 빠르게 따른다.
- 단점: product history, lifecycle, export 정책이 엔진 내부 표현에 묶인다.
- 리스크: 엔진 교체와 artifact policy 변경이 어렵다.

## 선택 근거

Object storage는 운영 provider를 지금 확정한다는 뜻이 아니라, artifact 저장 경계를 공식화한다는 뜻이다. S3-compatible boundary를 기준으로 두면 local/dev에서는 MinIO를 쓰고, future deployment에서는 S3/R2로 옮길 수 있다.

V1 checkpoint artifact를 Markdown snapshot으로 두면 history inspection path가 단순하고 명확해진다. 사용자는 이전 document content를 읽을 수 있고, 구현은 CRDT update replay나 rendered HTML 보존 정책을 먼저 확정하지 않아도 된다. CRDT update artifact는 live collaboration persistence의 책임으로 남기고, rendered HTML은 snapshot source of truth로 저장하지 않는다.

## 결과

### 긍정적 영향

- revision metadata와 artifact 책임이 분리된다.
- user blob과 collaboration artifact가 RDB rows에 과하게 묶이지 않는다.
- provider portability를 확보한다.

### 부정적 영향 또는 트레이드오프

- local review 구성이 단순 RDB보다 복잡할 수 있다.
- object artifact retention 정책은 후속 설계가 필요하다.
- Markdown snapshot은 provider state 전체를 복원하는 형식이 아니다. Restore, branching, CRDT replay 기반 diff가 필요하면 별도 history capability로 승격해야 한다.
- Rendered HTML을 저장하지 않으므로 과거 snapshot rendering은 현재 renderer와 Markdown snapshot에 의존한다.

### 후속 작업

- Production object storage provider를 S3, R2, MinIO 중 어디로 둘지 배포 전 확정한다.
- Live Yjs binary persistence adapter의 provider와 retention을 구현 task에서 확정한다.
- local/dev storage provider를 선택한다.
- Redis가 실제로 필요한지 POC/운영 단순성 기준으로 판단한다.

## 검증 방법

- checkpoint/history가 metadata와 artifact를 분리해 설명되는지 확인한다.
- CE-04 read-only inspect API가 checkpoint/revision artifact에서 Markdown snapshot을 반환하는지 확인한다.
- live Yjs binary persistence와 product revision snapshot artifact가 같은 타입/테이블/DTO로 합쳐지지 않는지 확인한다.
- durable document state가 Redis에만 존재하지 않는지 확인한다.
- MinIO/S3/R2 provider 이름이 domain code에 새지 않는지 확인한다.
- Local-compatible artifact adapter를 쓰더라도 API contract는 checkpoint metadata와 Markdown snapshot inspect response를 분리하는지 확인한다.
- `apps/collab` runtime이 live Yjs binary state를 adapter port로 저장/재로딩하며, 이 binary state가 checkpoint/revision artifact API로 노출되지 않는지 확인한다.

## 관련 문서

- `docs/product/editor/history.md`
- `docs/product/editor/offline-merge.md`
- `docs/domain/rules/collaboration-boundaries.md`
- ADR-0001
- ADR-0002

## 변경 이력

| 날짜       | 변경 내용                                                                          | 결정자     |
| ---------- | ---------------------------------------------------------------------------------- | ---------- |
| 2026-04-28 | 최초 작성                                                                          | nerdchanii |
| 2026-04-28 | MinIO 중심 표현을 S3-compatible object storage boundary로 정정                     | nerdchanii |
| 2026-04-29 | artifact 용어가 domain object를 의미하지 않음을 명시                               | nerdchanii |
| 2026-04-29 | checkpoint artifact format과 inspect path 미결정으로 proposed 유지 사유 명시       | nerdchanii |
| 2026-04-30 | V1 CE skeleton 범위에서 Markdown snapshot artifact와 read-only inspect path를 승인 | nerdchanii |
| 2026-04-30 | 첫 skeleton에서 production S3/R2/MinIO setup이 필수가 아님을 명시                  | nerdchanii |
| 2026-04-30 | live Yjs binary persistence의 local filesystem provider와 adapter 교체 가능성 명시 | nerdchanii |
