---
title: POC-001 Collaboration Engine Final Report
status: final-poc-report
generated_at: 2026-04-29
---

# POC-001 협업 엔진 최종 리포트

## 최종 판단

다음 구현 pass의 primary candidate는 **Tiptap + Yjs + Hocuspocus**로 둔다.

단, **Yorkie + raw ProseMirror**도 비교 후보에서 제거하지 않는다. Yorkie는 memory, measured payload, sync-server RSS에서 더 좋았고, Tiptap/Yjs는 live edit latency, reconnect convergence, 큰 문서 local editing, rich editor ergonomics에서 더 좋았다.

이 문서는 POC 결과 보고서다. 최종 accepted synchronization ADR은 남은 CE-01/CE-02 manual evidence와 persistence 결정을 기록한 뒤 작성한다.

## 비교 범위

이번 POC는 같은 editor에서 CRDT만 바꾼 microbenchmark가 아니라, 제품 후보 stack 전체를 비교했다.

| 후보 | 에디터 | Collaboration layer | Sync server |
| --- | --- | --- | --- |
| Tiptap + Yjs + Hocuspocus | Tiptap | Yjs | Hocuspocus |
| Yorkie + ProseMirror | raw ProseMirror | Yorkie | Yorkie server |

Editor 차이는 의도된 비교 조건이다. Tiptap 후보는 Tiptap editor integration, Yorkie 후보는 raw ProseMirror integration을 사용한다.

## Browser/Editor Stack Benchmark

최종 실행: `POC_PERF_RUNS=3 pnpm bench:perf`

조건:

- 3회 반복 median.
- Chromium, fixed desktop viewport.
- 같은 seeded Markdown fixture.
- 같은 Playwright flow.
- benchmark-local fresh app/sync server process.
- `POC_PERF_PORT_BASE=19000` 기반 격리 포트.
- 같은 first-ready gate: `editor-visible -> transport-ready -> seed-visible`.
- 같은 reconnect gate: offline/online token이 양쪽 rich editor에 보이는 시간.

| 항목 | Tiptap/Yjs | Yorkie | 우세 |
| --- | ---: | ---: | --- |
| 에디터 최초 표시 | 192.2 ms | 255 ms | Tiptap |
| 공통 ready gate 통과 | 230.8 ms | 259.1 ms | Tiptap |
| 원격 편집 반영 | 11.2 ms | 115.2 ms | Tiptap |
| 재연결 수렴 | 11 ms | 215.5 ms | Tiptap |
| 큰 source commit | 476.6 ms | 455.1 ms | Yorkie |
| 큰 문서 local edit | 14.9 ms | 63.3 ms | Tiptap |
| 큰 문서 이후 heap | 21.19 MB | 10.83 MB | Yorkie |
| 측정 network payload | 12.01 MB | 8.01 MB | Yorkie |
| sync server peak RSS | 110.98 MB | 41.73 MB | Yorkie |

해석:

- Tiptap/Yjs는 사용자 체감 live editing과 reconnect UX에 더 적합했다.
- Yorkie는 resource profile과 measured payload가 더 좋았다.
- 현재 과제의 CE-01/CE-03 사용자 가시 동작과 CE-05 editor ergonomics를 우선하면 Tiptap/Yjs가 앞선다.
- 운영 리소스 상한이 가장 큰 제약이 되면 Yorkie를 다시 강하게 검토해야 한다.

## Headless CRDT-only Benchmark

최종 실행: `pnpm bench:crdt`

이 벤치는 browser, DOM, editor binding, provider reconnect policy, persistence, sync server를 제외하고 CRDT text update exchange만 본다.

| 항목 | Yjs Y.Text | Yorkie Text | 우세 |
| --- | ---: | ---: | --- |
| seed 적용 | 0.1 ms | 0.1 ms | 동률 |
| local edits | 0.6 ms | 0.8 ms | Yjs |
| update encode | 0.1 ms | 0 ms | Yorkie |
| remote update 적용 | 0.2 ms | 1 ms | Yjs |
| update payload proxy | 2.1 KB | 12.6 KB | Yjs |
| gzip payload proxy | 494 B | 752 B | Yjs |

해석:

- 이 POC 규모에서는 두 CRDT text engine 모두 충분히 빠르다.
- Headless 경로에서는 Yjs가 local update/apply와 payload proxy 비용이 더 낮았다.
- 단, 이 수치는 제품 stack benchmark를 대체하지 않는다. CE-05는 editor integration 영향을 크게 받는다.

## 기능 검증

| 요구사항 영역 | Tiptap/Yjs | Yorkie | 메모 |
| --- | --- | --- | --- |
| CE-01 concurrent editing | partial | partial | 최종 two-browser manual recording 필요. |
| CE-02 presence | partial | partial | local presence는 확인, remote cursor/selection evidence 남음. |
| CE-03 offline reconnect merge | pass | pass | Playwright offline context test가 양쪽 모두 통과. |
| CE-05 rich/source/split/preview | pass | partial | Yorkie rich path는 CommonMark schema 제약 있음. |
| checkpoint/history shape | partial | partial | POC-level snapshot path 존재, durable history는 open. |
| adapter boundary | partial | partial | 폴더 격리는 되어 있으나 formal adapter harness는 open. |

## 오탐으로 제외한 결과

초기 Tiptap 30초대 browser benchmark 결과는 최종 판단에서 제외한다.

이유:

- 불공정한 benchmark harness에서 나온 값이었다.
- reconnect timing이 두 후보 공통 token-convergence gate가 아니라 Tiptap-specific readiness gate를 기다렸다.
- 사용자가 직접 실행한 수동 관찰과 fresh sanity check에서는 빠른 sync가 확인됐다.
- 최종 benchmark는 common gate와 isolated fresh server를 사용한다.

## 권고

다음 제품 구현 pass는 **Tiptap + Yjs + Hocuspocus**로 진행한다.

근거:

- 사용자 가시 edit latency가 더 낮다.
- common-gate benchmark에서 reconnect token convergence가 더 빠르다.
- 큰 문서 local edit latency가 더 낮다.
- rich editor UX와 CE-05에 더 잘 맞는다.
- 이 POC 기준 local reviewer setup이 더 단순하다.

다음 조건이 강해지면 Yorkie를 fallback으로 재검토한다.

- browser heap 상한이 더 중요해지는 경우.
- network payload 상한이 더 중요해지는 경우.
- sync-server RSS 상한이 더 중요해지는 경우.
- backend-centric document operation model이 제품 구조상 더 유리해지는 경우.

## Accepted ADR 전 남은 일

- CE-01 two-browser simultaneous editing convergence recording.
- CE-02 remote cursor/selection presence recording.
- Durable persistence와 server restart rehydration strategy 결정.
- Checkpoint/history를 explicit snapshot, server revision, 또는 둘 다로 갈지 결정.
- Collaboration adapter boundary formalization.
- ADR-0002를 supersede하거나 resolve하는 final accepted synchronization ADR 작성.

## 산출물

- [README 요약](README.md)
- [브라우저/에디터 benchmark](performance/performance-report.md)
- [Headless CRDT benchmark](performance/headless-crdt-report.md)
- [상세 evidence log](docs/evidence.md)
- [영어 실행계획](docs/execution-plan.md)
- [한국어 실행계획](docs/execution-plan.ko.md)
