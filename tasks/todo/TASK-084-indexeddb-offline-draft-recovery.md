---
title: TASK-084-indexeddb-offline-draft-recovery
status: todo
phase: P11
task_type: integration
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-082
  - TASK-083
write_set:
  - apps/web/package.json
  - apps/web/src/features/editor/adapters/**
  - e2e/ce-03-offline-merge.spec.ts
  - e2e/support/**
  - pnpm-lock.yaml
  - docs/product/editor/offline-merge.md
  - docs/requirements/items/REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY.md
  - tasks/todo/TASK-084-indexeddb-offline-draft-recovery.md
  - tasks/active/TASK-084-indexeddb-offline-draft-recovery.md
  - tasks/archive/TASK-084-indexeddb-offline-draft-recovery.md
forbidden_paths:
  - .note/**
related_requirements:
  - CE-03-OFFLINE-MERGE
  - REQ-OFFLINE-LOCAL-PERSISTENCE
  - REQ-OFFLINE-RECONNECT-MERGE
  - REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY
review_required: true
---

# TASK-084: IndexedDB Offline Draft Recovery

## 목표

Offline 상태에서 작성 중인 product editor document draft를 IndexedDB-backed local persistence에 저장하고,
tab/browser 종료 후 같은 browser profile에서 다시 열었을 때 복구한 뒤 reconnect 시 server state와 병합한다.

## 배경

- 공식 기준 문서: `subject.md`, `docs/compliance/subject-matrix.md`, `docs/requirements/registry.md`,
  `docs/requirements/items/REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY.md`.
- `CE-03-OFFLINE-MERGE`의 subject baseline은 open-page offline edit 보존과 reconnect merge로 이미
  검증되었다.
- 이 task는 CE-03의 product bar를 tab/browser 종료 또는 컴퓨터 종료 후 재방문하는 data-loss recovery까지
  높인다.
- IndexedDB는 product/domain API에 노출하지 않고 browser-local persistence adapter 뒤의 구현 detail로 둔다.
- `.note/**`는 scratch context이며 공식 요구사항 출처로 인용하지 않는다.

## 범위

### 포함

- Product editor의 현재 document draft를 browser-local IndexedDB persistence에 저장한다.
- Offline 상태에서 tab/browser context가 닫힌 뒤 같은 browser profile로 다시 열면 local draft를 복구한다.
- 복구된 draft를 reconnect 후 remote/server changes와 병합한다.
- Local draft 복구 또는 pending sync 상태를 사용자에게 명확히 표시한다.
- IndexedDB persistence가 collaboration/domain boundary 밖으로 새지 않도록 adapter boundary를 유지한다.
- Product e2e 또는 equivalent browser test로 tab/browser close and reopen recovery를 검증한다.

### 제외

- 전체 workspace offline cache.
- App shell 전체 offline reload.
- PWA/installable packaging.
- Tauri/Electron desktop packaging.
- Server-side conflict resolution policy 재설계.
- Auth/session product scope 변경.

## 계약과 의존성

| Task       | Mode       | Depends on             | Unlocks                             | Notes                                                                     |
| ---------- | ---------- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `TASK-084` | `blocking` | `TASK-082`, `TASK-083` | P11 offline recovery implementation | current product runtime과 final verification gate 이후 data-loss gap 보강 |

- 안정 contract: product editor opens authenticated workspace document through the runtime path completed by `TASK-082`.
- Mock 허용 여부: normal product path에서는 mock-only persistence를 사용하지 않는다.
- Browser-local persistence key는 workspace/document identity를 포함해야 하며 user/session 간 draft leakage를 막아야 한다.
- IndexedDB adapter는 Yjs/Tiptap local document state 또는 equivalent canonical editor draft state를 저장할 수 있어야 한다.

## Write Set

수정 가능:

- `apps/web/package.json`
- `apps/web/src/features/editor/adapters/**`
- `e2e/ce-03-offline-merge.spec.ts`
- `e2e/support/**`
- `pnpm-lock.yaml`
- `docs/product/editor/offline-merge.md`
- `docs/requirements/items/REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY.md`
- `tasks/todo/TASK-084-indexeddb-offline-draft-recovery.md`
- `tasks/active/TASK-084-indexeddb-offline-draft-recovery.md`
- `tasks/archive/TASK-084-indexeddb-offline-draft-recovery.md`

수정 금지:

- `.note/**`

## 인수 조건

- Alice가 product editor에서 offline 상태로 document를 편집한 뒤 tab/browser context를 닫아도 같은 browser profile에서 다시 열면 offline edit가 복구된다.
- 복구된 local draft는 reconnect 후 online 상태에서 들어온 remote edit와 함께 병합된다.
- IndexedDB implementation detail이 product/domain API, server contract, shared package boundary로 노출되지 않는다.
- Recovery 또는 pending sync 상태가 UI에서 보이고, server sync 완료 전 data-loss risk를 숨기지 않는다.
- Workspace-wide offline cache는 구현하지 않고 `REQ-DEFERRED-WORKSPACE-OFFLINE-CACHE` 범위로 남긴다.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck passes.
- 실행 명령: `scripts/with-node.sh pnpm test:e2e -- e2e/ce-03-offline-merge.spec.ts`
- 기대 결과: existing CE-03 offline merge path still passes.
- 실행 명령: product e2e for offline IndexedDB recovery
- 기대 결과: offline edit survives tab/browser close and reopen in the same browser profile, then merges after reconnect.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.
- Orchestration guardrail 확인: IndexedDB는 local persistence adapter detail이며 CE-03 product bar를 높이는 evidence로 다룬다.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
