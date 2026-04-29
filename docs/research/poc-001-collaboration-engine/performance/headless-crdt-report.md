---
title: POC-001 Headless CRDT Text Benchmark
status: measured
generated_at: 2026-04-29T03:09:58.995Z
---

# POC-001 Headless CRDT Text Benchmark

## 범위

이 benchmark는 in-memory text CRDT layer만 비교한다. Browser rendering, Tiptap, ProseMirror, provider reconnect policy, IndexedDB 또는 다른 persistence, sync server는 제외한다.

시나리오는 두 local document replica가 같은 seeded Markdown string을 독립적으로 편집하게 해서 disconnected period를 모사한다. Reconnect는 생성된 CRDT update를 한 번 교환하고 convergence를 확인하는 방식으로 모델링한다.

이는 engine-level diagnostic benchmark다. `performance-report.md`의 browser/editor stack benchmark를 대체하지 않고, 함께 읽어야 한다.

## 조건

- 실행 횟수: 5
- Source document: 18.1 KB
- Large sections: 60
- Peer별 repeated load edits: 20
- 제외 runtime: browser, editor, provider, persistence, sync server

## 요약 표

| 후보 | 수렴 | seed 적용 ms | local edit ms | update encode ms | remote update 적용 ms | update payload proxy | gzip payload proxy |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Yjs Y.Text | 예 | 0.1 | 0.6 | 0.1 | 0.2 | 2.1 KB | 494 B |
| Yorkie Text | 예 | 0.1 | 0.8 | 0 | 1 | 12.6 KB | 752 B |

## 해석

이 수치는 CRDT text operation cost와 update exchange cost만 분리한다. Markdown parsing, rich editor transaction mapping, DOM updates, awareness/presence, network reconnect backoff, local cache startup, server process overhead는 포함하지 않는다.

이전 30초대 결과는 browser/editor stack 경로의 오탐이며, CRDT engine-only 결론으로 사용하면 안 된다.

Cross-engine final text hash는 concurrent insert ordering이 implementation-defined라 서로 다를 수 있다. 이 benchmark는 서로 다른 CRDT implementation 사이의 동일 ordering이 아니라, 같은 engine replica 간 convergence를 확인한다.

Payload bytes는 wire-level network capture가 아니라 local serialization proxy다. Yjs는 binary update bytes를 사용한다. Yorkie는 이 headless 경로에서 Yorkie RPC transport를 의도적으로 제외하므로 serialized local change struct를 사용한다.

## 상세 Median Metrics

```json
{
  "yjs": {
    "seedApplyMs": 0.1,
    "localEditMs": 0.6,
    "encodeUpdatesMs": 0.1,
    "applyRemoteUpdatesMs": 0.2,
    "updatePayloadBytes": 2165,
    "gzipPayloadBytes": 494,
    "finalTextBytes": 20213,
    "operationCount": 44
  },
  "yorkie": {
    "seedApplyMs": 0.1,
    "localEditMs": 0.8,
    "encodeUpdatesMs": 0,
    "applyRemoteUpdatesMs": 1,
    "updatePayloadBytes": 12876,
    "gzipPayloadBytes": 752,
    "finalTextBytes": 20213,
    "operationCount": 44
  }
}
```
