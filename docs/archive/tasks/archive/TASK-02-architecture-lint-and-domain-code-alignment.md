---
title: TASK-02-architecture-lint-and-domain-code-alignment
status: archived
scope: architecture
---

# TASK-02: Architecture Lint And Domain Code Alignment

## 목표

문서화된 backend/domain architecture rule을 코드와 `arch:check` 검증에 반영한다.

## 범위

- `docs/architecture/backend.md`의 module ownership과 dependency direction을 기준으로 현재 API domain code를 정렬한다.
- `HistoryModule`이 first walking skeleton boundary가 되지 않도록 checkpoint/domain ownership을 `DocumentsModule` 중심으로 정리한다.
- Cross-module domain import 금지를 architecture lint에서 검증한다.
- `pnpm arch:check`가 domain boundary 위반을 잡도록 rule 또는 script를 보강한다.

## 제외

- CE-01부터 CE-05까지의 feature 구현.
- Restore, branching, workflow executor, workflow hooks.
- Product surface나 domain meaning 변경. 변경이 필요하면 먼저 관련 문서와 ADR 필요 여부를 확인한다.

## 검증

- `pnpm arch:check`
- `pnpm typecheck`
- `apps/api/src/modules/**/domain`에 Nest decorator, provider SDK, browser/editor/CRDT 타입, 다른 module domain import가 없는지 확인한다.

## 메모

- 관련 문서: `ARCHITECTURE.md`, `docs/architecture/backend.md`, `docs/domain/README.md`, ADR-0001.
