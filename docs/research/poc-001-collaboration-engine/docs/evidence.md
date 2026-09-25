---
title: POC-001 Collaboration Engine Evidence Log
status: measured-with-open-manual-items
---

# Evidence Log

이 문서는 세부 근거다. 결론과 핵심 표는 `../README.md`에서 먼저 확인하고, 최종 POC 리포트는 `../result.md`를 본다.

## 증거 기록

2026-04-29 KST에 실행 가능한 POC workspace와 두 후보 prototype을 만들고 build/typecheck/test/screenshot smoke를 실행했다. ADR-0002는 이 evidence를 반영해 Tiptap + Yjs + Hocuspocus를 다음 구현 pass의 협업 엔진으로 선택한다. 두 브라우저를 사용한 full CE-01/CE-02 product acceptance는 walking skeleton 구현에서 별도로 기록한다.

## 공통 조건

- Seed document: `shared` fixture의 Markdown 문서.
- Members: Alice, Bob.
- Offline token: `OFFLINE_ALICE_TOKEN`.
- Online token: `ONLINE_BOB_TOKEN`.
- 평가 기준: ADR-0002, `docs/execution-plan.md`, `docs/archive/compliance/subject-matrix.md`.

## 실행 로그

| 항목 | 결과 | 증거 |
| --- | --- | --- |
| Workspace install | pass | `pnpm install` completed for all 4 workspace projects. |
| Typecheck | pass | `pnpm typecheck` passed for shared, Tiptap, Yorkie. |
| Build | pass | `pnpm build` passed for both prototypes. Both Vite builds reported large bundle warnings. |
| Test | pass | `pnpm test` passed. Yorkie had 4 files / 8 tests; Tiptap uses typecheck as smoke test. |
| Tiptap server smoke | pass | `http://127.0.0.1:1235/health` returned `ok: true`, `documents: 1`. |
| Tiptap browser smoke | pass | Screenshot: `screenshots/tiptap-smoke.png`. |
| Yorkie browser smoke | pass | Screenshot: `screenshots/yorkie-smoke.png`. |
| Playwright screenshot | pass with escalation | Chromium needed sandbox escalation on macOS Mach port permission. |
| Tiptap offline reconnect E2E | pass | `pnpm test:e2e:tiptap` passed. Alice context used `setOffline(true)`, inserted `OFFLINE_ALICE_TOKEN`, Bob inserted `ONLINE_BOB_TOKEN`, both tokens converged after reconnect. |
| Yorkie offline reconnect E2E | pass | `pnpm test:e2e:yorkie` passed with a local Yorkie server on `localhost:8080`. Alice context used `setOffline(true)`, inserted `OFFLINE_ALICE_TOKEN`, Bob inserted `ONLINE_BOB_TOKEN`, both tokens converged after reconnect. |
| Full E2E suite | pass | `pnpm test:e2e` passed: 1 Tiptap pass, 1 Yorkie pass. |
| Yorkie E2E root-cause fix | pass | Initial Yorkie failure was caused by Vite prebundling `@yorkie-js/prosemirror` with a second `prosemirror-model` runtime copy. The prototype now aliases the Yorkie binding to its ESM build and dedupes ProseMirror packages. |
| Browser/editor stack performance benchmark | pass | `pnpm bench:perf` wrote `../performance/performance-report.md` and `../performance/performance-results.json`. This is a Chromium/Playwright browser/editor stack benchmark, not a headless CRDT-only benchmark. The final run uses isolated benchmark ports, fresh app/sync server processes, a shared first-ready gate, and a shared reconnect token-convergence gate. |
| Headless CRDT-only benchmark | pass | `pnpm bench:crdt` wrote `../performance/headless-crdt-report.md` and `../performance/headless-crdt-results.json`. It measures CRDT text document update/merge/apply behavior without browser, DOM, editor binding, preview rendering, provider reconnect, persistence, or dev-server overhead. |

### Tiptap + Yjs + Hocuspocus

| 시나리오 | 결과 | 증거 | 실패 모드 | 점수 | 메모 |
| --- | --- | --- | --- | ---: | --- |
| CE-01 concurrent editing | partial | Tiptap collaboration extensions compile; Hocuspocus server and single browser smoke passed. | Two-browser convergence not manually recorded yet. | 8/15 | Needs Alice/Bob simultaneous edit recording. |
| CE-02 presence | partial | CollaborationCaret implementation and presence pane exist; single browser smoke shows local member. | Remote cursor/selection not manually recorded yet. | 5/10 | Needs peer session cursor/selection evidence. |
| CE-03 offline merge | pass | `pnpm test:e2e:tiptap` uses Playwright context offline mode and verifies `OFFLINE_ALICE_TOKEN` + `ONLINE_BOB_TOKEN` on both clients after reconnect. | Server restart durability not covered by this test. | 18/20 | This is the strongest current CE-03 evidence. |
| persistence/rehydration | partial | Hocuspocus `onStoreDocument` keeps in-memory Yjs updates; browser local cache ready. | Server restart durability not implemented. | 6/12 | POC confirms path shape, not durable artifact strategy. |
| history snapshot | partial | Checkpoint API and inspector implemented; subagent browser smoke created/inspected a checkpoint. | Current screenshot was captured before checkpoint creation. | 8/12 | Checkpoints are in-memory and client-exported Markdown. |
| Markdown modes | pass | `screenshots/tiptap-smoke.png`; Source/Rich/Split/Preview controls compile and render shared seed. | `@tiptap/markdown` beta edge cases remain. | 9/12 | Shared seed fixture is now used. |
| adapter boundary | partial | Provider code is isolated under prototype folder; shared contract has no provider imports. | Prototype does not yet implement `CollaborationPocAdapter` directly. | 7/10 | Boundary is structural, not harness-enforced. |
| reviewer setup | pass | `pnpm server:tiptap`, `pnpm dev:tiptap`, screenshot smoke on 5174. | Requires two terminals. | 7/9 | Local setup is straightforward. |

### Yorkie + ProseMirror

| 시나리오 | 결과 | 증거 | 실패 모드 | 점수 | 메모 |
| --- | --- | --- | --- | ---: | --- |
| CE-01 concurrent editing | partial | Yorkie/ProseMirror binding compiles; screenshot smoke shows `online` and `synced`. | Two-browser convergence not manually recorded yet. | 7/15 | Needs Alice/Bob simultaneous edit recording. |
| CE-02 presence | partial | Remote selection plugin and presence panel implemented; screenshot shows local presence. | Remote cursor/selection not manually recorded yet. | 5/10 | Needs peer session cursor/selection evidence. |
| CE-03 offline merge | pass | `pnpm test:e2e:yorkie` uses Playwright context offline mode and verifies `OFFLINE_ALICE_TOKEN` + `ONLINE_BOB_TOKEN` on both clients after reconnect. | Server restart durability not covered by this test. | 15/20 | Requires local Yorkie server and Vite ESM alias for the binding. |
| persistence/rehydration | partial | Yorkie server connection works against localhost:8080. | External server uses in-memory persistence unless started with MongoDB. | 4/12 | Durability requires extra infra. |
| history snapshot | partial | Checkpoint helper tests passed; inspector UI can create snapshots. | Snapshot is POC root data, not server revision history. | 8/12 | Suitable as explicit checkpoint proof-of-shape. |
| Markdown modes | partial | `screenshots/yorkie-smoke.png`; Source/Split/Preview render shared seed. | Rich editing uses CommonMark schema; GFM table rich editing is limited. | 8/12 | Preview covers table, rich structure is weaker. |
| adapter boundary | partial | Provider code is isolated under prototype folder; shared contract has no provider imports. | Prototype does not yet implement `CollaborationPocAdapter` directly. | 7/10 | Boundary is structural, not harness-enforced. |
| reviewer setup | partial | `pnpm dev:yorkie` runs; screenshot smoke on 5175. | Requires external `yorkie server`; port 8080 was already occupied by Docker listener. | 5/9 | More setup risk than Tiptap. |

## 성능 비교 요약

상세 리포트는 `../performance/performance-report.md`에 있다. 이 표는 browser/editor stack benchmark 결과다. Chromium, prototype editor integration, Markdown source/rich/split/preview path, local dev server, sync transport 비용이 포함된다. 2026-04-29 KST 기준 최종 실행은 Chromium, benchmark-local fresh app/sync server, 60-section / 19.8 KB generated Markdown payload, 3회 반복 median으로 측정했다. Editor 차이는 의도된 후보 stack 차이로 인정한다: Tiptap 후보는 Tiptap editor integration, Yorkie 후보는 raw ProseMirror integration이다.

정정 및 최종 재측정: 기존 1-run browser benchmark의 Tiptap 30초대 값은 live edit synchronization latency로 해석하면 안 된다. 벤치마크 harness를 수정해 두 후보 모두 같은 gate sequence(`editor-visible -> transport-ready -> seed-visible`)와 같은 reconnect gate(offline/online token이 양쪽 rich editor에 모두 표시되는 시간)를 사용하게 했다. 또한 기존 manual-review 서버를 재사용하지 않고 `POC_PERF_PORT_BASE=19000`에서 파생한 격리 포트로 두 후보의 app/sync server를 모두 fresh process로 띄웠다.

| 항목 | Tiptap + Yjs + Hocuspocus | Yorkie + ProseMirror | 관찰 |
| --- | ---: | ---: | --- |
| Initial editor visible | 192.2 ms | 255 ms | Tiptap이 더 빠름 |
| First comparable ready | 230.8 ms | 259.1 ms | Tiptap이 더 빠름 |
| Peer-visible edit latency | 11.2 ms | 115.2 ms | Tiptap이 더 빠름 |
| Reconnect convergence | 11 ms | 215.5 ms | Tiptap이 더 빠름 |
| Large source commit | 476.6 ms | 455.1 ms | Yorkie가 약간 빠름 |
| Large-document local edit | 14.9 ms | 63.3 ms | Tiptap이 더 빠름 |
| JS heap after large document | 21.19 MB | 10.83 MB | Yorkie가 적음 |
| Measured network payload | 12.01 MB | 8.01 MB | Yorkie가 적음 |
| Sync server peak RSS | 110.98 MB | 41.73 MB | Yorkie가 적음 |

### Browser/editor readiness 진단

`../performance/performance-report.md`의 readiness phase diagnostics 기준으로 두 후보 모두 같은 first-ready gate를 통과한다.

| 후보 | phase | 주요 관찰 |
| --- | --- | --- |
| Tiptap + Yjs + Hocuspocus | first | `editorVisibleMs: 655.1`, `transportReadyMs: 690.9`, `seedVisibleMs: 708.4` |
| Tiptap + Yjs + Hocuspocus | peer | `editorVisibleMs: 168.2`, `transportReadyMs: 206.6`, `seedVisibleMs: 208` |
| Tiptap + Yjs + Hocuspocus | reconnect | `tokenConvergenceMs: 11` |
| Yorkie + ProseMirror | first | `editorVisibleMs: 404.7`, `transportReadyMs: 407.1`, `seedVisibleMs: 408` |
| Yorkie + ProseMirror | peer | `editorVisibleMs: 217.1`, `transportReadyMs: 219.3`, `seedVisibleMs: 220` |
| Yorkie + ProseMirror | reconnect | `tokenConvergenceMs: 108.4` |

실험 기록: Yjs/Tiptap 후보에서 local cache `synced` event miss 가능성을 줄이기 위해 `indexeddb.synced`와 `whenSynced`를 함께 보도록 보강했다. 이후 30초대 현상은 Tiptap/Yjs 자체 병목이 아니라 이전 benchmark harness의 불공정한 readiness gate로 재분류했다. 최종 benchmark는 reconnect에서 후보별 readiness를 다시 기다리지 않고, 두 후보 모두 offline/online token convergence만 측정한다.

주의: 현재 성능 수치는 local dev server에서의 방향성 POC evidence이며 production capacity planning으로 사용하지 않는다. Headless CRDT-only benchmark와 직접 비교하지 않는다. 두 벤치는 측정 계층이 다르며, 현재 표는 product-facing editor stack 선택의 방향성 evidence다. 반복 수를 늘리려면 `POC_PERF_RUNS=3 pnpm bench:perf`처럼 실행한다.

## Headless CRDT-only 비교 요약

상세 리포트는 `../performance/headless-crdt-report.md`에 있다. 이 표는 browser, editor, provider, persistence, sync server를 제외하고 `Y.Text`와 `Yorkie.Text`의 in-memory text CRDT update exchange만 측정한다.

| 항목 | Yjs Y.Text | Yorkie Text | 관찰 |
| --- | ---: | ---: | --- |
| Seed apply | 0.1 ms | 0.1 ms | 사실상 동률 |
| Local edits | 0.6 ms | 0.8 ms | 둘 다 약 1 ms 이하 |
| Encode updates | 0.1 ms | 0 ms | 둘 다 sub-ms 수준 |
| Apply remote updates | 0.2 ms | 1 ms | Yjs가 더 낮음 |
| Update payload proxy | 2.1 KB | 12.6 KB | Yjs가 작음; wire-level network capture는 아님 |
| Gzip payload proxy | 494 B | 752 B | Yjs가 작음; Yorkie는 serialized local change struct 기준 |

해석: CRDT-only 경로는 둘 다 빠르다. 기존 30초대 browser benchmark 수치는 CRDT text algorithm 자체도, 사용자가 체감한 live edit sync도 아니며, 최종 isolated common-gate benchmark로 대체된 harness anomaly로 본다.

## 기록할 증거

- manual test step
- 필요한 경우 screenshot 또는 recording
- benchmark summary
- failure mode
- local setup note
- ADR-0002 decision link
