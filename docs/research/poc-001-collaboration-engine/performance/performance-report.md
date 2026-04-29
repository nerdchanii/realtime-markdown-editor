---
title: POC-001 Collaboration Engine Browser/editor Stack Benchmark
status: measured
generated_at: 2026-04-29T05:02:25.141Z
---

# POC-001 브라우저/에디터 Stack 성능 Benchmark

## 범위

이 benchmark는 두 POC 후보를 같은 browser automation flow로 비교한다. 측정에는 editor integration, DOM/rendering, local dev server, sync transport 비용이 포함된다. Headless CRDT-only benchmark가 아니다. Editor integration 차이는 후보 stack의 일부로 인정한다. Tiptap 후보는 Tiptap을 사용하고, Yorkie 후보는 raw ProseMirror를 사용한다. 아래 수치는 Chromium, fixed desktop viewport, local dev server, 60 sections (19.8 KB) generated Markdown payload 기준 3회 실행 median이다.

이 수치는 local POC 방향성 evidence이며 production capacity planning 수치가 아니다. Server process CPU/RSS는 listener port 기준 OS process tool로 sampling하므로 근사값이다.

공통 first-ready metric은 두 후보 모두 같은 gate sequence를 사용한다: editor-visible -> transport-ready -> seed-visible. 후보별 transport state는 공통 transport-ready gate 판정에만 사용하고, diagnostics에 보존한다.

이 실행은 `POC_PERF_PORT_BASE=19000`에서 파생한 포트에 fresh benchmark-local app/sync server process를 띄운다. 기존 manual-review server는 재사용하지 않는다. Benchmark port가 이미 사용 중이면 실행은 실패하고 다른 port base를 요구한다.

## 요약 표

| 후보 | 에디터 최초 표시 ms | 공통 ready gate ms | 원격 편집 반영 ms | 재연결 수렴 ms | 큰 source commit ms | 큰 문서 local edit ms | 큰 문서 이후 heap MB | network payload | sync server peak RSS MB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tiptap + Yjs + Hocuspocus | 192.2 | 230.8 | 11.2 | 11 | 476.6 | 14.9 | 21.19 | 12.01 MB | 110.98 |
| Yorkie + ProseMirror | 255 | 259.1 | 115.2 | 215.5 | 455.1 | 63.3 | 10.83 | 8.01 MB | 41.73 |

## Readiness Phase 진단

이 phase timing은 첫 번째 run에서만 capture한다. 어떤 readiness gate가 browser/editor stack timing을 지배하는지 확인하기 위한 진단 자료다.

| 후보 | phase | timings ms |
| --- | --- | --- |
| Tiptap + Yjs + Hocuspocus | first | editorVisibleMs: 655.1, transportReadyMs: 690.9, seedVisibleMs: 708.4 |
| Tiptap + Yjs + Hocuspocus | peer | editorVisibleMs: 168.2, transportReadyMs: 206.6, seedVisibleMs: 208 |
| Tiptap + Yjs + Hocuspocus | reconnect | tokenConvergenceMs: 11 |
| Yorkie + ProseMirror | first | editorVisibleMs: 404.7, transportReadyMs: 407.1, seedVisibleMs: 408 |
| Yorkie + ProseMirror | peer | editorVisibleMs: 217.1, transportReadyMs: 219.3, seedVisibleMs: 220 |
| Yorkie + ProseMirror | reconnect | tokenConvergenceMs: 108.4 |

## 1-7 비교

1. 초기 loading과 bundle 영향: tiptap 후보가 editor surface를 더 빨리 표시했다. Bundle size는 아래 표에 있다.
2. 공통 first-ready: tiptap 후보가 같은 first-ready gate sequence를 더 빨리 통과했다.
3. 편집 latency: tiptap 후보가 더 낮은 peer-visible edit latency를 보였다.
4. 재연결 수렴: tiptap 후보가 한 client 재연결 후 더 빨리 수렴했다.
5. 큰 Markdown 입력 지연: yorkie 후보가 큰 source payload를 더 빨리 commit했다. 큰 문서 local edit latency는 tiptap 후보가 더 낮았다.
6. Browser memory: yorkie 후보가 큰 문서 시나리오 이후 JS heap을 더 적게 사용했다.
7. Server process와 network payload: yorkie 후보가 sampled sync-server RSS를 더 적게 사용했다. 측정 HTTP payload는 yorkie 후보가 더 적었다. Chromium CDP에서 노출되는 경우 WebSocket frame payload도 포함한다.

## Bundle Size

| 후보 | raw assets | gzip assets |
| --- | ---: | ---: |
| Tiptap + Yjs + Hocuspocus | 819.4 KB | 256.9 KB |
| Yorkie + ProseMirror | 871.5 KB | 261.8 KB |

## 상세 Median Metrics

```json
{
  "tiptap": {
    "initialEditorVisibleMs": 192.2,
    "firstComparableReadyMs": 230.8,
    "firstContentfulPaintMs": 184,
    "localEditEchoMs": 9.6,
    "remoteEditVisibleMs": 11.2,
    "reconnectConvergenceMs": 11,
    "largeSourceCommitMs": 476.6,
    "largeRichRenderAfterSourceMs": 110.6,
    "largeLocalEditEchoMs": 14.9,
    "largeSourceReflectionMs": 64.6,
    "browserHeapAfterFirstReadyMb": 10.99,
    "browserHeapAfterLargeMb": 21.19,
    "browserDomNodesAfterLarge": 12870,
    "networkHttpBytes": 12352551,
    "networkWsSentBytes": 118028,
    "networkWsReceivedBytes": 122172,
    "syncServerPeakRssMb": 110.98,
    "syncServerPeakCpuPercent": 18,
    "appServerPeakRssMb": 174.03,
    "appServerPeakCpuPercent": 25.7
  },
  "yorkie": {
    "initialEditorVisibleMs": 255,
    "firstComparableReadyMs": 259.1,
    "firstContentfulPaintMs": 160,
    "localEditEchoMs": 11.9,
    "remoteEditVisibleMs": 115.2,
    "reconnectConvergenceMs": 215.5,
    "largeSourceCommitMs": 455.1,
    "largeRichRenderAfterSourceMs": 54.6,
    "largeLocalEditEchoMs": 63.3,
    "largeSourceReflectionMs": 101.8,
    "browserHeapAfterFirstReadyMb": 7,
    "browserHeapAfterLargeMb": 10.83,
    "browserDomNodesAfterLarge": 12995,
    "networkHttpBytes": 8399925,
    "networkWsSentBytes": 0,
    "networkWsReceivedBytes": 60,
    "syncServerPeakRssMb": 41.73,
    "syncServerPeakCpuPercent": 3.3,
    "appServerPeakRssMb": 158.2,
    "appServerPeakCpuPercent": 13.8
  }
}
```

## 주의사항

- Production deployment가 아니라 local dev server 기준이다.
- Yorkie는 isolated benchmark RPC port의 benchmark-local in-memory server로 시작한다.
- Browser memory metric은 Chromium CDP Performance metrics에서 가져오며 run 사이에 noise가 있다.
- Server CPU/RSS는 listening port 기준으로 sampling한다. Process tree와 watcher subprocess 때문에 근사값일 수 있다.
- Network payload는 HTTP encoded bytes와 Chromium CDP에 노출되는 WebSocket frame payload를 포함한다. Full packet capture가 아니다.
- Headless CRDT-only 결과와 직접 비교하지 않는다. 두 벤치는 서로 다른 계층을 측정한다.
