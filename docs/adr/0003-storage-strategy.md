---
id: ADR-0003
title: "ADR-0003: 저장소 역할은 RDB, S3-compatible object storage, 선택적 realtime support로 분리한다"
status: proposed
date: 2026-04-28
authors:
  - Codex
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

## 후보안

### 1. RDB + S3-compatible object storage + optional realtime support

- 장점: metadata, artifact, transient state의 책임이 분리된다.
- 단점: local setup 설명이 늘어날 수 있다.
- 리스크: 과제 범위에 비해 storage infra가 커질 수 있다.

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

## 결과

### 긍정적 영향

- revision metadata와 artifact 책임이 분리된다.
- user blob과 collaboration artifact가 RDB rows에 과하게 묶이지 않는다.
- provider portability를 확보한다.

### 부정적 영향 또는 트레이드오프

- local review 구성이 단순 RDB보다 복잡할 수 있다.
- object artifact retention 정책은 후속 설계가 필요하다.

### 후속 작업

- POC 이후 collaboration artifact format을 확정한다.
- local/dev storage provider를 선택한다.
- Redis가 실제로 필요한지 POC/운영 단순성 기준으로 판단한다.

## 검증 방법

- checkpoint/history가 metadata와 artifact를 분리해 설명되는지 확인한다.
- durable document state가 Redis에만 존재하지 않는지 확인한다.
- MinIO/S3/R2 provider 이름이 domain code에 새지 않는지 확인한다.

## 관련 문서

- `docs/product/editor/history.md`
- `docs/product/editor/offline-merge.md`
- `docs/domain/rules/collaboration-boundaries.md`
- ADR-0001
- ADR-0002

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
| 2026-04-28 | MinIO 중심 표현을 S3-compatible object storage boundary로 정정 | Codex |
