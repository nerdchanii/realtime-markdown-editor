---
id: REQ-PRODUCTION-ACCOUNT-MANAGEMENT
title: 사용자가 정상 제품 경로에서 로그인하고 계정을 관리할 수 있어야 한다.
status: planned
category: product-extension
type: functional
priority: high
taskability: taskable
scope: identity
derived_from: REQ-IDENTITY-MEMBERSHIP
depends_on:
  - REQ-IDENTITY-MEMBERSHIP
blocks:
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
next_step: 기존 session API를 사용자-facing login/logout/session restore UI와 account create/update/deactivate flow로 연결한다.
refs:
  - docs/product/workspace/user-membership.md
  - packages/contracts/src/http/routes.ts
  - tasks/archive/TASK-074-auth-session-owner-member-authorization.md
---

# REQ-PRODUCTION-ACCOUNT-MANAGEMENT

Backend session boundary가 있어도 사용자가 normal product path에서 로그인할 방법이 없으면 제품
요구사항을 충족했다고 보기 어렵다. Product surface는 reviewer/dev seed 선택이 아니라 실제 사용자가
이해할 수 있는 login, logout, session restore, account management flow를 제공해야 한다.

Acceptance:

- 사용자는 normal product UI에서 로그인하고 로그아웃할 수 있다.
- 새 user account 생성 또는 local product 계정 bootstrap flow가 명확하다.
- 사용자는 display name 같은 기본 account profile을 수정할 수 있다.
- 계정 비활성화 또는 삭제 정책이 정의되어 있고 membership, checkpoint authorship, auditability와 충돌하지 않는다.
- Product reviewer flow는 `?member=alice` 같은 URL member spoofing에 의존하지 않고 session 기반으로 동작한다.
