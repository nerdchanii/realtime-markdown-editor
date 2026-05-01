---
id: REQ-PRESENCE-CARET-LABEL-LEGIBILITY
title: Remote caret는 더 두껍게 보이고 member name label을 함께 표시해야 한다.
status: planned
category: subject-derived
type: ux
taskability: taskable
scope: collaboration
derived_from: REQ-PRESENCE-MEMBER-AWARENESS
depends_on:
  - REQ-PRESENCE-MEMBER-AWARENESS
blocks: []
next_step: rich editor presence decoration의 caret 두께와 label 표시 규칙을 정하고 CE-02 e2e 또는 visual smoke로 검증한다.
refs:
  - docs/product/editor/presence.md
  - docs/compliance/subject-matrix.md
---

# REQ-PRESENCE-CARET-LABEL-LEGIBILITY

Remote presence는 색상만으로 식별하기 어려우면 안 된다. Remote caret indicator는 editor
surface에서 충분히 두껍게 보여야 하고, caret 근처에 workspace member name label을 함께 표시해야
한다.

Acceptance:

- Alice 화면에서 Bob의 remote caret가 thin 1px line처럼 묻히지 않고 명확한 visual weight로 보인다.
- Bob의 workspace member display name이 remote caret와 함께 표시된다.
- Selection range만 있는 경우에도 member identity를 잃지 않는다.
