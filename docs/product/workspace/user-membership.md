---
title: docs/product/workspace/user-membership.md
surface: workspace
related_requirements:
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRESENCE-MEMBER-AWARENESS
related_adrs:
  - ADR-0001
---

# docs/product/workspace/user-membership.md

## 의도

제품은 user identity와 workspace membership을 분리한다. 이를 통해 full authorization을 첫 skeleton에 넣지 않아도 presence, authorship, member properties를 안정적으로 다룰 수 있다.

## 제품 범위

- `User`를 model로 둔다.
- `WorkspaceMembership`을 model로 둔다.
- Presence와 checkpoint authorship에는 membership identity를 사용한다.
- Local development에서는 seeded reviewer membership을 허용한다.
- Reviewer route의 `?member=alice`, `?member=bob` 값은 production login이 아니라 local review
  identity 선택이다.

## 보류

- Authorization과 RBAC.
- Enterprise identity provider는 보류한다.
- Production-grade account administration은 보류한다.
- Production workspace/folder CRUD persistence는 CE recovery 이후로 보류한다.

## 인증 메모

JWT cookie login은 나중에 추가할 수 있다. Authorization constraint가 first subject skeleton을 막으면 안 된다.
