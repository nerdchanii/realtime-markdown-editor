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
- Local development에서는 seeded reviewer membership을 bootstrap 용도로만 허용한다.
- Reviewer route의 `?member=alice`, `?member=bob` 값은 production login이 아니라 legacy local review
  identity 선택이며, product reviewer flow는 session 기반으로 이동해야 한다.

## 보류

- Enterprise identity provider는 보류한다.
- owner/member를 넘는 editor/viewer/admin role expansion은 보류한다.
- SSO, SCIM, organization administration은 보류한다.

## 인증 메모

Backend session boundary는 존재하지만, 사용자가 이해할 수 있는 login/account/member management product flow는 별도 high-priority requirement로 추적한다.
