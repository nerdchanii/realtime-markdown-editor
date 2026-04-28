---
title: docs/research/poc-001-collaboration-engine/README.md
status: planned
related_requirements:
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
related_adrs:
  - ADR-0002
---

# docs/research/poc-001-collaboration-engine/README.md

## 목적

이 POC는 final accepted synchronization ADR을 쓰기 전에 어떤 collaboration/editor stack이 subject skeleton과 product constraint를 감당할 수 있는지 판단한다.

## 후보

- Tiptap + Yjs + Hocuspocus
- Yorkie + ProseMirror

## 평가 기준

- 동시 편집 수렴성.
- Cursor와 selection presence.
- Open-page offline edit와 reconnect merge.
- Persistence와 rehydration path.
- Checkpoint/history snapshot 추출.
- Rich, Markdown source, Split mode 적합성.
- Markdown portability와 export path.
- Adapter boundary 적합성.
- Local reviewer setup 복잡도.

## 산출물

- `result.md`: 결론과 final recommendation.
- `evidence.md`: 관찰 요약, manual test note, benchmark link, unresolved risk.

## 결정 규칙

ADR-0002는 proposed POC decision으로 유지한다. POC evidence가 생기면 별도 accepted final synchronization ADR을 만들거나 ADR-0002를 명시적으로 supersede한다.
