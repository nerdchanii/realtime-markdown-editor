---
title: Decision log
status: living
---

# Decision log

ADR 로 만들 만큼 크지는 않지만 PR 이 끝난 뒤에도 남아야 하는 결정을 기록한다. G1 결정이 대부분이다.
큰 결정과 G2 결정은 `docs/adr/` 에 둔다. 규칙은 [ADR-0010](../adr/0010-decision-gates-and-provenance.md) 을 따른다.

- `decided_by`: `user` 또는 `agent:<도구>`
- `ratified_by`: `user`, `lazy-consensus`, `pending`
- G1 은 `ratify_by` 날짜까지 사용자가 이의를 제기하지 않으면 `lazy-consensus` 로 확정한다.

| 날짜 | 결정 | 게이트 | decided_by | ratified_by | ratify_by | revisit_if | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-25 | 레거시 요구사항, CE, task 문서를 `docs/archive/` 로 옮기고 에이전트 기본 읽기 경로에서 제외한다 | G1 | user (슬림 재구성 지시) / agent:claude-code (세부 배치) | pending | 2026-10-02 | archive 문서를 자주 참조해야 하는 작업이 반복되면 | 단계 1 PR |
| 2026-09-25 | `docs/research/` 는 active 문서지만 링크 검사에서는 제외한다(POC 원본 보존) | G1 | agent:claude-code | pending | 2026-10-02 | research 문서를 규칙 근거로 인용하게 되면 | 단계 1 PR |
| 2026-09-25 | `scripts/with-node.sh` 는 `fnm` 이 없으면 PATH 의 Node 로 실행한다(cloud 에이전트 환경 대응) | G1 | agent:claude-code | pending | 2026-10-02 | Node 버전 불일치로 문제가 생기면 | 단계 1 PR |
| 2026-09-25 | 미결 요구 21건을 1:1 로 옮기지 않고 결정 단위 추적 Issue 7개(#2–#8)로 묶는다. 과거 REQ 는 참고 자료로만 링크하고, Markdown 세부 기능 4건은 문서 타입 ADR 뒤에 다시 본다 | G1 | user (A안 선택) / agent:claude-code (분류) | user | - | 흡수한 REQ 가 결정 과정에서 누락되면 | Issue #2–#8 |
| 2026-09-25 | ADR-0012 owner/admin 세부 규칙: owner 는 workspace 당 한 명이고 생성자가 맡는다. workspace 삭제와 소유권 이전은 owner 만 할 수 있다. admin 은 owner 를 바꾸거나 제거할 수 없고, admin 끼리는 서로 강등하거나 제거할 수 있다 | G1 | agent:claude-code (사용자 결정 "owner 는 가장 높은 admin"을 구체화) | pending | 2026-10-02 | owner 여러 명이 필요하거나 admin 끼리 서로 제거하는 것을 막아야 하면 | PR #9 |
| 2026-09-25 | ~~ADR-0013 기존 Yjs state migration 순서~~ 철회. 비가역 migration 은 G2 인데 G1 로 잘못 분류했다(Codex 리뷰). 2026-09-26 사용자 결정으로 대체: migration 하지 않고 개발 데이터를 버린 뒤 다시 생성한다 | G2 | user | user | - | 배포 뒤 스키마가 바뀌면 migration 정책을 따로 정한다 | PR #9 |
| 2026-09-25 | LocalUser 계정 연결이 충돌하면(이미 다른 계정에 연결된 경우 등) 자동 병합하지 않고 사용자에게 확인한다 | G1 | agent:claude-code | pending | 2026-10-02 | 연결 흐름을 구현할 때 확인 단계가 과하면 | PR #9 |
| 2026-09-26 | 옛 schema 버전의 IndexedDB draft 는 읽지 않고 삭제한다(draft 키에 schema 버전 포함) | G1 | agent:claude-code | pending | 2026-10-03 | 개발 중 draft 유실이 문제가 되면 | PR #9 |
| 2026-09-26 | checkpoint snapshot 은 `{ type, schemaVersion, content }` 형태로 type 을 표시한다. 타입별 snapshot 과 viewer 가 정의되기 전에는 그 타입을 출시하지 않는다 | G1 | agent:claude-code | pending | 2026-10-03 | code 타입 구현에서 다른 형태가 필요하면 | PR #9 |
