---
id: ADR-0002
title: "ADR-0002: 협업 엔진으로 Tiptap + Yjs + Hocuspocus를 선택한다"
status: accepted
date: 2026-04-29
authors:
  - nerdchanii
decision_type: architecture
tags:
  - collaboration-engine
  - tiptap
  - yjs
  - hocuspocus
  - poc
  - benchmark
  - crdt
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - REQ-OFFLINE-RECONNECT-MERGE
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-EDITOR-RICH-SOURCE-SPLIT
related_documents:
  - subject.md
  - docs/research/poc-001-collaboration-engine/README.md
  - docs/research/poc-001-collaboration-engine/result.md
  - docs/research/poc-001-collaboration-engine/docs/evidence.md
  - docs/research/poc-001-collaboration-engine/performance/performance-report.md
  - docs/research/poc-001-collaboration-engine/performance/headless-crdt-report.md
  - docs/compliance/subject-matrix.md
supersedes: []
superseded_by: null
---

# ADR-0002: 협업 엔진으로 Tiptap + Yjs + Hocuspocus를 선택한다

## 맥락

과제는 동기화 방식으로 CRDT, OT, 자체 구현 등을 허용한다. CE-01~CE-03은 협업 엔진의 수렴성과 reconnect merge 품질에 직접 의존하고, CE-05의 rich Markdown authoring 경험도 editor stack과 강하게 연결된다.

ADR-0001은 협업 provider를 domain model 밖의 adapter 경계 뒤에 둔다고 결정했다. 따라서 최종 엔진을 선택하더라도 Yjs, Hocuspocus, Tiptap 타입은 domain/product API로 새면 안 된다.

POC-001은 `docs/research/poc-001-collaboration-engine/` 아래에서 Tiptap + Yjs + Hocuspocus와 Yorkie + ProseMirror를 같은 seeded Markdown, Alice/Bob identity, offline/online token, Playwright flow로 비교했다.

## 결정

다음 제품 구현 pass의 협업 엔진은 **Tiptap + Yjs + Hocuspocus**로 진행한다.

- Editor integration은 Tiptap을 사용한다.
- CRDT document state와 update merge는 Yjs를 사용한다.
- Realtime sync server는 Hocuspocus를 사용한다.
- Collaboration provider 세부 타입과 persistence artifact는 adapter/infrastructure 경계 뒤에 둔다.
- ADR-0002가 POC 결과 기반 sync engine decision을 겸하므로, 별도 sync ADR placeholder는 더 이상 사용하지 않는다. 향후 결정이 바뀌면 새 ADR이 이 ADR을 supersede한다.

## 후보안

### 1. Tiptap + Yjs + Hocuspocus

- 장점: Tiptap collaboration integration, Yjs CRDT merge, Hocuspocus provider 구성이 open-page offline reconnect merge와 Markdown editor experience를 함께 검증하기에 적합하다.
- POC 결과: browser/editor benchmark에서 reconnect convergence, peer-visible edit latency, large-document local edit latency가 이번 제품 우선순위에 충분한 여유를 보였다.
- 트레이드오프: browser heap, measured payload, sync-server RSS는 Yorkie 쪽 수치가 더 낮았다.
- 리스크: Markdown canonical/export 정책과 durable collaboration artifact 저장 전략을 제품 구현에서 명확히 해야 한다.

### 2. Yorkie + ProseMirror

- 장점: POC에서 memory, measured payload, sync-server RSS 수치가 낮았다.
- POC 결과: offline reconnect E2E는 통과했고, rich editing은 CommonMark schema 범위 안에서 확인됐다. Local setup은 Yorkie server 준비가 필요했다.
- 제외 이유: B2B 협업 제품의 핵심 고객 가치는 팀 문서 작성 흐름을 끊지 않고, 네트워크 변동 후에도 local/remote edits를 손실 없이 합치는 것이다. 이번 walking skeleton에서는 reconnect 검증과 rich Markdown authoring 경험을 한 흐름으로 빠르게 묶을 수 있는 Tiptap/Yjs 조합을 먼저 채택한다.
- 재검토 조건: browser heap, network payload, sync-server RSS 상한이 제품의 최우선 제약으로 바뀌면 다시 비교한다.

### 3. 자체 WebSocket/OT 구현

- 장점: 최소 기능을 직접 통제할 수 있다.
- 제외 이유: offline merge와 conflict resolution을 직접 책임져야 하며, 과제 기간 안에 CE-01~CE-03을 안정적으로 증명하기 어렵다.

## 선택 근거

POC-001의 최종 browser/editor stack benchmark는 3회 반복 median이며, 기존 30초대 Tiptap readiness 값은 불공정한 benchmark gate로 인한 오탐으로 제외했다. 초기 readiness 관련 수치는 harness sanity check로만 보고, 채택 근거는 reconnect merge 안정성, 협업 중 반영 지연, Markdown 편집 경험, 운영 리스크로 제한한다.

| 판단 축 | Tiptap/Yjs | Yorkie | 결정 반영 |
| --- | ---: | ---: | --- |
| Offline reconnect E2E | pass | pass | 두 후보 모두 기본 조건 충족 |
| Reconnect convergence | 11 ms | 215.5 ms | 이번 skeleton의 핵심 리스크를 줄이는 근거 |
| Peer-visible edit latency | 11.2 ms | 115.2 ms | 공동 편집 feedback loop에 긍정적 |
| Large-document local edit | 14.9 ms | 63.3 ms | 긴 문서 작성 흐름에 긍정적 |
| Rich Markdown authoring suitability | pass | partial | Markdown authoring flow에 긍정적 |
| Browser heap after large document | 21.19 MB | 10.83 MB | Yorkie의 강점, 운영 리스크 검토 기준 |
| Measured network payload | 12.01 MB | 8.01 MB | Yorkie의 강점, 재검토 기준 |
| Sync server peak RSS | 110.98 MB | 41.73 MB | Yorkie의 강점, 재검토 기준 |

Headless CRDT-only benchmark에서는 두 후보 모두 충분히 빠르다. 현재 결정은 CRDT algorithm의 우열이 아니라, 이번 제품 skeleton에서 reconnect 검증, live editing feedback, rich Markdown authoring flow를 가장 빠르게 묶어낼 수 있는 stack을 고르는 결정이다.

## 결과

### 긍정적 영향

- 협업 엔진 선택이 POC evidence에 기반해 확정된다.
- CE-01, CE-03, CE-05 구현 경로를 Tiptap/Yjs/Hocuspocus 중심으로 좁힌다.
- 기존 sync ADR placeholder를 ADR-0002로 정리할 수 있다.
- ADR-0001의 adapter 원칙을 유지한 채 provider-specific 구현을 infrastructure로 격리한다.

### 부정적 영향 또는 트레이드오프

- Browser heap, measured payload, sync-server RSS는 Yorkie 쪽 수치가 더 낮았으므로 운영 제약이 커지면 재검토해야 한다.
- Hocuspocus/Yjs artifact persistence와 server restart rehydration 전략은 제품 구현에서 별도로 확정해야 한다.
- Tiptap rich editor model과 Markdown portability 사이의 round-trip 정책을 계속 검증해야 한다.

### 완료된 작업

- Tiptap/Yjs/Hocuspocus와 Yorkie/ProseMirror prototype을 작성했다.
- 공통 seed, member identity, offline/online token, benchmark harness를 만들었다.
- POC workspace에서 typecheck, build, unit/smoke test, offline reconnect E2E, browser/editor benchmark, headless CRDT benchmark를 실행했다.
- POC 결과와 evidence를 `docs/research/poc-001-collaboration-engine/`에 기록했다.
- 이 ADR을 accepted sync engine decision으로 업데이트했다.

### 후속 작업

- 제품 walking skeleton에서 CE-01 two-browser convergence와 CE-02 remote cursor/selection presence를 실제 제품 경로로 기록한다.
- Hocuspocus/Yjs persistence artifact 저장과 server restart rehydration 정책을 ADR-0003 구현 세부로 확정한다.
- Checkpoint/history는 ADR-0004의 explicit checkpoint 정책에 맞춰 제품 API로 구현한다.

## 검증 방법

- `docs/research/poc-001-collaboration-engine` 기준 `pnpm test`가 통과해야 한다.
- 필요하면 `pnpm typecheck`, `pnpm build`, `pnpm test:e2e:tiptap`, `POC_PERF_RUNS=3 pnpm bench:perf`, `pnpm bench:crdt`로 POC evidence를 재생성한다.
- 제품 구현에서는 `docs/compliance/subject-matrix.md`의 CE-01~CE-05 evidence 기준으로 최종 acceptance를 확인한다.

## 관련 문서

- `docs/research/poc-001-collaboration-engine/README.md`
- `docs/research/poc-001-collaboration-engine/result.md`
- `docs/research/poc-001-collaboration-engine/docs/evidence.md`
- `docs/research/poc-001-collaboration-engine/performance/performance-report.md`
- `docs/research/poc-001-collaboration-engine/performance/headless-crdt-report.md`
- `docs/compliance/subject-matrix.md`
- ADR-0001
- ADR-0003
- ADR-0004

## 변경 이력

| 날짜 | 변경 내용 | 결정자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | nerdchanii |
| 2026-04-28 | POC ADR와 별도 sync decision 분리 정책 명시 | nerdchanii |
| 2026-04-29 | POC 결과에 따라 Tiptap + Yjs + Hocuspocus 선택을 accepted decision으로 확정 | nerdchanii |
