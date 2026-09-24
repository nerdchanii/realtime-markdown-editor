---
title: docs/product/editor/offline-merge.md
surface: editor
related_requirements:
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-OFFLINE-RECONNECT-MERGE
  - REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY
related_adrs:
  - ADR-0002
  - ADR-0003
---

# docs/product/editor/offline-merge.md

## 의도

사용자는 network가 끊겨도 작성 중인 editor session을 잃지 않아야 한다. 열린 문서의 reconnect merge와
tab/browser 종료 후 draft recovery까지 포함해 data-loss 없이 병합되는 것을 목표로 한다.

## 제품 범위

- 현재 열린 editor가 disconnected 상태가 되어도 local edits를 보존한다.
- Reconnecting 또는 pending-local-edit state를 표시한다.
- Reconnect 후 ADR-0002에서 선택한 Tiptap + Yjs + Hocuspocus adapter를 통해 local/remote changes를 병합한다.
- Offline 상태에서 작성 중인 현재 document draft는 tab/browser 종료 후에도 IndexedDB-backed local persistence에서 복구되어야 한다.
- IndexedDB persistence는 product/domain API에 드러나지 않고 Tiptap/Yjs collaboration adapter 내부에서
  current member와 document key로 scope 된 Yjs update snapshot을 저장한다.
- 같은 browser profile에서 tab을 닫았다가 다시 열면 browser-local draft가 먼저 복구되고, reconnect 후
  Hocuspocus/Yjs merge 경로로 remote state와 수렴한다.

## 보류

- App shell 전체 offline reload.
- 설치형 PWA.
- Tauri/Electron desktop packaging은 보류한다.
- 전체 workspace offline cache.

## 검증

한 client가 disconnect 상태에서 열린 document를 편집하고, 다른 client가 online 상태에서 편집한 뒤, reconnect 시 두 고유 edit가 모두 남는지 확인한다. 추가로 offline 상태에서 tab/browser를 닫았다가 같은 browser profile로 다시 열어도 작성 중이던 draft가 복구되고 reconnect 후 병합되는지 확인한다.

Evidence:

- `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- `set -a; source .env; set +a; scripts/with-node.sh pnpm test:e2e -- e2e/ce-03-offline-merge.spec.ts`
