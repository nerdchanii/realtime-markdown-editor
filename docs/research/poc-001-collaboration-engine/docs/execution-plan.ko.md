---
title: POC-001 Collaboration Engine ExecPlan
status: completed-for-engine-selection
language: ko
related_adrs:
  - ADR-0002
related_requirements:
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
---

# POC-001 협업 엔진 비교 실행계획

이 ExecPlan은 살아있는 실행 문서다. 진행 중에는 `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`를 계속 갱신한다.

## Purpose / Big Picture

이 POC의 목적은 ADR-0002에서 sync engine 결정을 확정하기 전에 `Tiptap + Yjs + Hocuspocus`와 `Yorkie + ProseMirror`가 과제 핵심 경로를 감당하는지 같은 기준으로 확인하는 것이다. 결정 기준은 B2B 팀 문서 고객에게 필요한 realtime Markdown co-editing, presence, open-page offline reconnect merge, Markdown source/rich/split authoring flow다.

엔진 선택 작업의 완료 상태는 두 후보 prototype을 로컬에서 실행할 수 있고, 비교 가능한 자동화 evidence가 기록되며, ADR-0002가 선택된 stack을 문서화하는 것이다. Full two-browser CE-01/CE-02 product acceptance는 walking skeleton 구현 경로에서 이어서 검증한다.

## Progress

- [x] 2026-04-29 KST: ADR-0002, POC README, subject compliance matrix, requirement registry, architecture boundary를 확인했다.
- [x] 2026-04-29 KST: 요구사항/구조/평가 루브릭을 확인하기 위해 서브에이전트를 사용했다.
- [x] 2026-04-29 KST: 역할별 실행 서브에이전트를 배정했다.
- [x] 2026-04-29 KST: Korean ExecPlan과 English ExecPlan을 작성했다.
- [x] 2026-04-29 KST: POC 전용 pnpm workspace를 만들었다.
- [x] 2026-04-29 KST: 공통 adapter contract, seed Markdown, member identity, scenario/rubric 자료를 만들었다.
- [x] 2026-04-29 KST: Tiptap/Yjs/Hocuspocus prototype을 만들었다.
- [x] 2026-04-29 KST: Yorkie/ProseMirror prototype을 만들었다.
- [x] 2026-04-29 KST: 두 후보의 typecheck/build/test와 screenshot smoke를 실행했다.
- [x] 2026-04-29 KST: 두 후보에 Playwright browser-context offline reconnect E2E 테스트를 추가했다.
- [x] 2026-04-29 KST: Tiptap CE-03 E2E pass를 확인했다.
- [x] 2026-04-29 KST: Yorkie CE-03 E2E failure의 root cause가 중복 ProseMirror runtime load임을 확인하고 수정했다.
- [x] 2026-04-29 KST: Yorkie CE-03 E2E pass를 확인했다.
- [x] 2026-04-29 KST: 두 후보에 대한 1~7번 성능 벤치마크 harness를 추가하고 실행했다.
- [x] 2026-04-29 KST: full two-browser CE-01/CE-02 product acceptance는 engine-selection POC의 blocker가 아니라 walking skeleton 검증 경로로 넘긴다.
- [x] 2026-04-29 KST: interim `docs/evidence.md`와 `result.md`를 채웠다.
- [x] 2026-04-29 KST: ADR-0002를 accepted sync engine decision으로 업데이트하고 관련 sync ADR placeholder를 정리한다.

## Context and Orientation

현재 저장소는 제품 코드가 없는 문서 중심 스켈레톤이다. `docs/research/poc-001-collaboration-engine/`가 ADR-0002에서 지정한 연구 산출물 위치이며, POC 코드는 최종 제품 코드가 아니라 엔진 선택을 위한 격리된 연구 코드로 둔다.

검증 기준의 최상위 지도는 `docs/archive/compliance/subject-matrix.md`다. POC는 `CE-01` 동시 편집, `CE-02` cursor/selection presence, `CE-03` offline reconnect merge, `CE-05` rich/source/split preview 적합성에 대한 engine-selection evidence를 기록한다. Full CE-01/CE-02 acceptance는 product walking skeleton에서 이어서 검증한다. `CE-04` revision history는 final product 요구사항이지만, 이 POC에서는 collaboration artifact에서 explicit checkpoint snapshot을 추출할 수 있는지를 확인한다.

Provider-specific 타입인 Yjs, Hocuspocus, Yorkie, ProseMirror, Tiptap은 domain/product API로 새면 안 된다. POC도 이 원칙을 확인하기 위해 shared adapter contract를 provider-neutral하게 유지한다.

## Subagent Roles

Lead/Integrator는 실행문서, workspace root, 최종 통합, evidence/result, ADR-0002 decision update를 맡는다.

Tooling/Shared subagent는 `shared/` 안에서 provider-neutral contract, seed fixture, member identity, scenario definitions, scoring rubric을 만든다.

Tiptap subagent는 `prototypes/tiptap-yjs-hocuspocus/` 안에서 Hocuspocus server와 Tiptap collaborative editor prototype을 만든다.

Yorkie subagent는 `prototypes/yorkie-prosemirror/` 안에서 Yorkie client와 ProseMirror collaborative editor prototype을 만든다.

QA/Evidence 역할은 prototype 통합 후 Lead가 수행하거나 별도 agent로 위임한다. 두 후보를 같은 순서와 같은 seed data로 검증하고 점수표를 채운다.

## Plan of Work

첫 단계는 실행 가능한 POC workspace를 만드는 것이다. `docs/research/poc-001-collaboration-engine/package.json`과 `pnpm-workspace.yaml`을 만들고, 각 prototype은 독립 Vite application으로 둔다.

두 번째 단계는 공통 자료를 고정하는 것이다. seed Markdown은 heading, paragraph, link, list, task marker, table, code fence를 포함한다. member identity는 `Alice`와 `Bob`으로 고정하고, 각각 stable display name과 color를 가진다. offline merge 검증 token은 `OFFLINE_ALICE_TOKEN`과 `ONLINE_BOB_TOKEN`을 사용한다.

세 번째 단계는 두 prototype을 같은 UI로 만드는 것이다. 첫 화면은 editor-first workspace이며 landing page가 아니다. 화면에는 document context, member selector/query param, sync status, Source/Rich/Split/Preview mode, checkpoint action, presence surface가 있어야 한다.

네 번째 단계는 같은 시나리오로 검증하는 것이다. 두 브라우저 세션에서 동시 편집, selection/cursor 이동, offline edit 후 reconnect, reload/rehydration, checkpoint snapshot, Markdown mode 전환을 실행한다.

마지막 단계는 evidence를 문서화하는 것이다. `docs/evidence.md`에는 관찰 단계와 결과를 남기고, `result.md`에는 점수, 선택 후보, 제외 후보, 남은 risk를 남긴다. ADR-0002는 accepted sync engine decision을 기록한다.

## Concrete Steps

작업 위치는 repository root `/Users/gim-yechan/.codex/worktrees/702c/realtime-markdown-editor`다.

1. POC workspace로 이동한다.

       cd docs/research/poc-001-collaboration-engine

2. 의존성을 설치한다.

       pnpm install

3. Tiptap 후보를 실행한다. 별도 터미널에서 server와 app을 띄운다.

       pnpm server:tiptap
       pnpm dev:tiptap

4. Yorkie 후보를 실행한다. 별도 터미널에서 local Yorkie server와 app을 띄운다.

       yorkie server
       pnpm dev:yorkie

5. 검증과 build/typecheck를 실행한다.

       pnpm typecheck
       pnpm build
       pnpm test

## Validation and Acceptance

`CE-01`은 Alice와 Bob 두 세션이 같은 workspace document를 열고 서로 다른 위치와 인접 위치를 편집한 뒤 manual refresh 없이 같은 Markdown으로 수렴하면 통과다.

`CE-02`는 remote cursor와 selected range가 stable member label/color와 함께 보이고, presence 정보가 Markdown body에 섞이지 않으면 통과다.

`CE-03`은 Alice 세션을 open-page 상태로 offline 처리한 뒤 `OFFLINE_ALICE_TOKEN`을 입력하고, Bob online 세션에서 `ONLINE_BOB_TOKEN`을 입력한 뒤 reconnect 시 두 token이 모두 남으면 통과다.

Markdown 적합성은 Source/Rich/Split/Preview 전환 후 heading, link, list, task marker, table, code fence가 손실 없이 유지되고 snapshot/export 가능한 Markdown 문자열을 얻으면 통과다.

Checkpoint 적합성은 explicit checkpoint action으로 author, timestamp, message, content snapshot을 만들고 reviewer가 이전 content를 확인할 수 있으면 통과다.

## Scoring

총점은 100점이다. `CE-01`, `CE-02`, `CE-03` 중 하나라도 재현 불가하면 총점과 별개로 final recommendation에서 제외한다.

| 항목 | 배점 |
| --- | ---: |
| 동시 편집 수렴성 | 15 |
| Presence | 10 |
| Offline reconnect merge | 20 |
| Persistence/rehydration | 12 |
| Snapshot/history extraction | 12 |
| Markdown source/split/preview | 12 |
| Adapter boundary | 10 |
| 초기 setup 복잡도 | 9 |

## Idempotence and Recovery

POC 코드는 research path 아래에만 둔다. final product app 구조로 승격하지 않는다. 설치가 실패하면 package files와 README를 유지하고, 실패한 command와 error summary를 `docs/evidence.md`에 기록한다.

Yorkie durability 검증에서 MongoDB가 준비되지 않으면 in-memory local server로 behavior를 먼저 검증하고, server restart persistence는 risk로 기록한다.

## Surprises & Discoveries

- Observation: 저장소에는 아직 앱/package 구조가 없다.
  Evidence: `package.json`, `pnpm-workspace.yaml`, Vite/Next 설정이 존재하지 않는다.
- Observation: POC 위치는 문서상 이미 정해져 있다.
  Evidence: ADR-0002와 POC README가 `docs/research/poc-001-collaboration-engine/`를 산출물 위치로 참조한다.
- Observation: 초기 Yorkie E2E 실패는 Yorkie merge engine 결론이 아니었다.
  Evidence: Playwright trace에 `looks like multiple versions of prosemirror-model were loaded`가 기록되어 있었고, Vite가 CJS Yorkie binding을 prebundle하면서 ProseMirror runtime을 중복 로드했다.
- Observation: 최종 isolated browser/editor stack 성능 실행은 두 후보 모두 fresh benchmark-local server와 같은 readiness/convergence gate를 사용한다. 3회 반복 median 기준으로 Tiptap은 initial editor visibility, first comparable readiness, peer-visible edit latency, reconnect token convergence, 큰 문서 local edit latency에서 앞섰고, Yorkie는 large source commit, browser heap, measured payload, sync-server RSS에서 앞섰다.
  Evidence: `POC_PERF_RUNS=3 pnpm bench:perf`가 생성한 `../performance/performance-report.md`.
- Observation: Headless CRDT-only benchmark는 algorithm-level update/merge cost를 분리하고 browser/editor/rendering overhead를 제외한다.
  Evidence: `pnpm bench:crdt`가 생성한 `../performance/headless-crdt-report.md`.
- Observation: 이전 Yjs/Tiptap browser/editor stack의 30초대 결과는 live synchronization 결론이 아니라 불공정한 readiness gate로 생긴 benchmark harness 문제였다.
  Evidence: 3회 반복 common-gate `../performance/performance-report.md`에서 Tiptap first comparable readiness는 230.8 ms, reconnect token convergence는 11 ms로 측정됐다.

## Decision Log

- Decision: POC 코드는 `docs/research/poc-001-collaboration-engine/` 아래에 격리한다.
  Rationale: 현재 저장소에는 제품 앱 구조가 없고, ADR-0002가 이 경로를 POC evidence 위치로 지정한다.
  Date/Author: 2026-04-29 / Codex
- Decision: package manager는 `pnpm`을 사용한다.
  Rationale: workspace filter 명령으로 두 prototype을 격리해 실행하기 쉽다.
  Date/Author: 2026-04-29 / Codex
- Decision: ADR-0002에서 Tiptap + Yjs + Hocuspocus를 선택한다.
  Rationale: POC evidence에서 Tiptap/Yjs/Hocuspocus가 이번 walking skeleton의 reconnect convergence, live editing latency, 큰 문서 local editing, rich editor ergonomics, 초기 setup 복잡도에 충분한 여유를 보였다.
  Date/Author: 2026-04-29 / Codex

## Outcomes & Retrospective

실행으로 두 후보의 실행 가능한 prototype을 만들고 `pnpm typecheck`, `pnpm build`, `pnpm test`, local server health, screenshot smoke, Playwright browser-context offline reconnect E2E, isolated browser/editor stack 성능 벤치마크, headless CRDT-only 벤치마크를 확인했다. ADR-0002는 reconnect token convergence, peer-visible edit latency, rich/source/split editor ergonomics, 초기 setup 복잡도에서 이번 walking skeleton에 충분한 여유를 보인 Tiptap + Yjs + Hocuspocus를 선택한다. Yorkie는 CE-03을 통과했고 최종 isolated 3회 반복 browser/editor stack 성능 실행에서 browser heap, sampled server RSS, measured payload, large source commit에 강점이 있어 strong comparison candidate로 남긴다. Headless CRDT-only 결과는 프로젝트 간 순위가 아니라 algorithm-level 참고 자료로 별도 해석한다.
