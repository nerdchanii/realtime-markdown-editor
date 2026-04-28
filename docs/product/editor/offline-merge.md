---
title: docs/product/editor/offline-merge.md
surface: editor
related_requirements:
  - CE-03-OFFLINE-MERGE
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-OFFLINE-RECONNECT-MERGE
related_adrs:
  - ADR-0002
  - ADR-0003
  - final sync ADR
---

# docs/product/editor/offline-merge.md

## 의도

사용자는 network가 끊겨도 이미 열린 editor session을 잃지 않아야 한다. `CE-03`은 open-page offline editing과 reconnect merge로 검증한다.

## 제품 범위

- 현재 열린 editor가 disconnected 상태가 되어도 local edits를 보존한다.
- Reconnecting 또는 pending-local-edit state를 표시한다.
- Reconnect 후 선택된 collaboration engine을 통해 local/remote changes를 병합한다.

## 보류

- App shell의 offline reload.
- 설치형 PWA.
- Tauri/Electron desktop packaging은 보류한다.
- 전체 workspace offline cache.

## 검증

한 client가 disconnect 상태에서 열린 document를 편집하고, 다른 client가 online 상태에서 편집한 뒤, reconnect 시 두 고유 edit가 모두 남는지 확인한다.
