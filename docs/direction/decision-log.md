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
