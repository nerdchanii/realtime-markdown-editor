---
id: REQ-PRODUCTION-ACCOUNT-MANAGEMENT
title: 사용자가 정상 제품 경로에서 로그인하고 계정을 관리할 수 있어야 한다.
status: done
category: product-foundation
type: functional
priority: high
taskability: done
scope: identity
derived_from: REQ-IDENTITY-MEMBERSHIP
depends_on:
  - REQ-IDENTITY-MEMBERSHIP
blocks:
  - REQ-WORKSPACE-MEMBER-MANAGEMENT
refs:
  - docs/product/workspace/user-membership.md
  - packages/contracts/src/http/routes.ts
  - tasks/archive/TASK-074-auth-session-owner-member-authorization.md
  - tasks/archive/TASK-094-product-account-surface-and-policy.md
  - tasks/archive/TASK-101-product-account-create.md
  - tasks/archive/TASK-102-account-profile-update.md
---

# REQ-PRODUCTION-ACCOUNT-MANAGEMENT

Backend session boundary가 있어도 사용자가 normal product path에서 로그인할 방법이 없으면 계정
기능이 제품 흐름과 연결되지 않는다. Product surface는 사용자가 이해할 수 있는 login, logout,
session restore, account management flow를 제공해야 한다.

Presence identity, checkpoint authorship, workspace access, collaboration session 발급은 신뢰 가능한
account/session 경계 위에서 동작한다.

Acceptance:

- 사용자는 normal product UI에서 로그인하고 로그아웃할 수 있다.
- 새 user account 생성 또는 local product 계정 bootstrap flow가 명확하다.
- 사용자는 display name 같은 기본 account profile을 수정할 수 있다.
- 계정 비활성화 또는 삭제 정책이 정의되어 있고 membership, checkpoint authorship, auditability와 충돌하지 않는다.
- Product flow는 `?member=alice` 같은 URL member spoofing에 의존하지 않고 session 기반으로 동작한다.

## Current State

`TASK-094` removed local sample-account language from the primary sign-in UI, moved settings behind the
profile menu, renders account/workspace/project identity from the authenticated session and
workspace navigation, and records the account deactivation/delete policy in the product docs.
`TASK-101` adds a local account creation contract/API and a normal auth-screen flow that
creates the account, creates a session, and lands the user in workspace onboarding. `TASK-102`
adds an authenticated profile name update contract/API and replaces the read-only User settings
name placeholder with an editable account form.

The account deactivation/delete acceptance is satisfied as a policy boundary rather than an
executable mutation: initial account management does not provide hard delete, and the
documented policy preserves `User`, `WorkspaceMembership`, checkpoint authorship, and auditability.
