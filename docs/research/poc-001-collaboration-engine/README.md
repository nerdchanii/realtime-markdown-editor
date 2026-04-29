---
title: POC-001 Collaboration Engine Result
status: final-poc-report
related_requirements:
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
related_adrs:
  - ADR-0002
---

# POC-001 Collaboration Engine Result

## 결론

현재 POC evidence와 ADR-0002 결정 기준으로 **Tiptap + Yjs + Hocuspocus**를 다음 구현 pass의 협업 엔진으로 선택한다.

이 결론은 “Yjs가 모든 계층에서 Yorkie보다 빠르다”는 뜻이 아니다. 이번 POC는 실제 제품 후보 stack 비교이며, Tiptap 후보는 Tiptap editor integration, Yorkie 후보는 raw ProseMirror integration을 사용한다. Headless CRDT-only 결과는 별도 참고 자료로만 본다.

## 무엇을 비교했나

| 후보 | 에디터 | CRDT / 동기화 | 서버 | 상태 |
| --- | --- | --- | --- | --- |
| Tiptap + Yjs + Hocuspocus | Tiptap | Yjs | local Hocuspocus | selected |
| Yorkie + ProseMirror | raw ProseMirror | Yorkie | local Yorkie server | 비교 유지 후보 |

두 후보 모두 같은 seeded Markdown, 같은 Alice/Bob identity, 같은 offline/online token, 같은 Playwright flow로 검증했다.

## 최종 성능 요약

최종 browser/editor stack benchmark는 **3회 반복 median**이다. 기존 manual-review server를 재사용하지 않고 `POC_PERF_PORT_BASE=19000` 기반 격리 포트에서 app/sync server를 fresh process로 띄웠다.

| 항목 | Tiptap/Yjs | Yorkie | 관찰 |
| --- | ---: | ---: | --- |
| 원격 편집 반영 | 11.2 ms | 115.2 ms | Tiptap/Yjs 쪽 수치가 낮음 |
| 재연결 수렴 | 11 ms | 215.5 ms | Tiptap/Yjs 쪽 수치가 낮음 |
| 큰 source commit | 476.6 ms | 455.1 ms | 거의 유사, Yorkie 쪽 수치가 약간 낮음 |
| 큰 문서 local edit | 14.9 ms | 63.3 ms | Tiptap/Yjs 쪽 수치가 낮음 |
| 큰 문서 이후 heap | 21.19 MB | 10.83 MB | Yorkie 쪽 수치가 낮음 |
| 측정 network payload | 12.01 MB | 8.01 MB | Yorkie 쪽 수치가 낮음 |
| sync server peak RSS | 110.98 MB | 41.73 MB | Yorkie 쪽 수치가 낮음 |

해석:

- Tiptap/Yjs는 실시간 편집 반영, 재연결 수렴, 큰 문서 local editing에서 이번 walking skeleton에 필요한 여유를 보였다.
- Yorkie는 메모리, 측정 payload, sync-server RSS에서 뚜렷한 장점이 있었다.
- B2B 고객의 팀 문서 작성 흐름과 CE-03 offline reconnect 안정성을 우선해 ADR-0002는 Tiptap/Yjs/Hocuspocus를 먼저 선택한다.
- 운영 리소스와 payload가 최우선 제약이 되는 시점에는 Yorkie를 다시 비교한다.

## 오탐으로 제외한 결과

초기 browser benchmark에서 Tiptap 쪽에 30초대 readiness 값이 나온 적이 있다. 이 값은 최종 판단에서 제외했다.

제외 이유:

- reconnect 구간에서 Tiptap만 후보별 readiness gate를 다시 기다리는 불공정한 harness였다.
- 사용자가 직접 실행한 수동 관찰과 fresh sanity check는 sub-100ms대 동기화를 보였다.
- 이후 benchmark를 common gate로 고쳤다: `editor-visible -> transport-ready -> seed-visible`.
- reconnect도 두 후보 모두 offline/online token이 양쪽 rich editor에 보이는 시간만 측정하게 했다.

## 기능 검증 요약

| 항목 | Tiptap/Yjs | Yorkie | 비고 |
| --- | --- | --- | --- |
| compile/typecheck | pass | pass | `pnpm typecheck` |
| offline reconnect E2E | pass | pass | 양쪽 모두 offline/online token 수렴 |
| rich/source/split/preview | pass | partial | Yorkie rich editing은 CommonMark schema 제약 있음 |
| presence | partial | partial | local presence 확인, remote selection recording은 남음 |
| persistence/restart | partial | partial | durable persistence는 아직 최종 설계 필요 |

## 최종 리포트와 세부 자료

- [최종 POC 리포트](result.md)
- [브라우저/에디터 stack benchmark](performance/performance-report.md)
- [Headless CRDT-only benchmark](performance/headless-crdt-report.md)
- [상세 evidence log](docs/evidence.md)
- [영어 실행계획](docs/execution-plan.md)
- [한국어 실행계획](docs/execution-plan.ko.md)

폴더 구조:

- `README.md`: 처음 읽는 결론과 핵심 수치.
- `result.md`: 최종 POC 판단 근거.
- `performance/`: 재생성 가능한 benchmark 결과물.
- `docs/`: 실행계획과 상세 evidence.
- `prototypes/`, `shared/`, `e2e/`, `benchmarks/`: POC 실행 코드.

## 직접 실행

이 폴더 기준으로 실행한다.

```bash
pnpm install
pnpm test
pnpm typecheck
POC_PERF_RUNS=3 pnpm bench:perf
pnpm bench:crdt
```

Tiptap 후보를 수동으로 열어보려면:

```bash
pnpm server:tiptap
pnpm dev:tiptap
```

그 다음 `http://127.0.0.1:5173/?user=alice&document=manual-yjs-test`와 Bob URL을 함께 연다.
