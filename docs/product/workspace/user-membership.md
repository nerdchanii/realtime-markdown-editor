---
title: docs/product/workspace/user-membership.md
surface: workspace
related_requirements:
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-PRESENCE-MEMBER-AWARENESS
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
related_adrs:
  - ADR-0001
  - ADR-0008
---

# docs/product/workspace/user-membership.md

## 의도

제품은 user identity와 workspace membership을 분리한다. 이를 통해 로그인 session, workspace member authorization, presence, authorship, member properties를 안정적으로 다룰 수 있다.

## 제품 범위

- `User`를 model로 둔다.
- `WorkspaceMembership`을 model로 둔다.
- Presence와 checkpoint authorship에는 membership identity를 사용한다.
- Product session은 current user와 current workspace membership을 결정한다.
- 사용자는 normal product UI에서 로그인하고 로그아웃할 수 있어야 한다.
- Workspace owner는 member를 추가, 역할 변경, 제거할 수 있어야 한다.
- Local seeded account도 product credential과 membership boundary를 가져야 한다.
- URL parameter나 client-supplied member id는 product identity source of truth가 아니다.

## 보류

- Enterprise identity provider는 보류한다.
- owner/member를 넘는 editor/viewer/admin role expansion은 보류한다.
- SSO, SCIM, organization administration은 보류한다.

## 인증 메모

Backend session boundary와 사용자가 이해할 수 있는 login/account/member management flow는 모두 product
foundation이다. Account management의 상세 운영 범위는 별도 requirement로 나누더라도, 현재 제품
경로가 신뢰할 수 없는 identity를 사용하면 완료로 보지 않는다.
