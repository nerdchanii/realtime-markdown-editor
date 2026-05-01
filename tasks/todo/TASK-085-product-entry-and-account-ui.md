---
title: TASK-085-product-entry-and-account-ui
status: todo
phase: P11
task_type: parallel-ui
task_mode: blocking
owner: unassigned
depends_on:
  - TASK-083
write_set:
  - apps/web/**
  - apps/api/**
  - e2e/**
  - docs/product/workspace/user-membership.md
  - docs/requirements/items/REQ-PRODUCTION-ACCOUNT-MANAGEMENT.md
  - tasks/todo/TASK-085-product-entry-and-account-ui.md
  - tasks/active/TASK-085-product-entry-and-account-ui.md
  - tasks/archive/TASK-085-product-entry-and-account-ui.md
forbidden_paths:
  - .note/**
related_requirements:
  - REQ-PRODUCTION-ACCOUNT-MANAGEMENT
  - REQ-IDENTITY-MEMBERSHIP
  - REQ-ACCOUNT-WORKSPACE-ONBOARDING
review_required: true
---

# TASK-085: Product Entry and Account UI

## 목표

사용자가 normal product path에서 로그인, session restore, logout, basic profile/account surface에 접근할 수 있게 한다.

## 배경

- `TASK-074`에서 auth/session/owner/member authorization boundary가 생겼다.
- `TASK-082`와 `TASK-083`은 product runtime integration과 verification을 닫았다.
- 아직 사용자가 제품 UI에서 로그인하거나 로그아웃하고 profile/account surface를 보는 흐름은 부족하다.
- `DESIGN.md`는 settings/profile entry를 top bar profile menu에 둔다.
- 로그인 후 workspace가 없거나 여러 개인 사용자의 routing은
  `REQ-ACCOUNT-WORKSPACE-ONBOARDING`을 item으로 승격한 뒤 이 task scope에 연결해야 한다.

## 범위

### 포함

- User-facing login entry surface.
- Existing session restore path와 logout action.
- Profile menu에 `Profile`, `Settings`, `Notifications`, `Keyboard Shortcuts`, `Sign out` entry를 맞춘다.
- Basic account/profile edit 또는 아직 API가 없으면 명시적 read-only/profile placeholder와 follow-up task를 기록한다.
- Product reviewer path가 URL member spoofing에 의존하지 않는지 e2e 또는 smoke로 확인한다.
- Post-login routing은 existing workspace membership이 있는 사용자까지만 다루고, no-workspace onboarding은 별도 requirement 승격 후 연결한다.

### 제외

- Enterprise auth provider, SSO, SCIM.
- Billing/admin.
- Full invitation inbox.
- Public demo entrypoint.
- Workspace lifecycle implementation.
- Full account/workspace onboarding.
- Invitation inbox.

## 인수 조건

- 사용자는 제품 UI에서 로그인하고 로그아웃할 수 있다.
- Reload 후 session이 복구되거나 명확한 login state로 돌아간다.
- Profile menu가 `DESIGN.md`의 required items를 제공한다.
- Auth/session flow가 frontend-only identity state나 URL member spoofing에 의존하지 않는다.
- 필요한 API gap은 숨기지 않고 follow-up requirement/task로 기록한다.
- 로그인 후 workspace가 없는 경우는 임시로 숨기지 않고 `REQ-ACCOUNT-WORKSPACE-ONBOARDING` follow-up으로 명시한다.

## 검증

- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- 기대 결과: web typecheck passes.
- 실행 명령: `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- 기대 결과: api typecheck passes if API files changed.
- 실행 명령: targeted product auth/account e2e or smoke test
- 기대 결과: login, reload/session restore, logout path works through normal product UI.

## Review

- Spec compliance review 필요 여부: 필요.
- Code quality review 필요 여부: 필요.
- Boundary review 필요 여부: 필요.

## Archive Checklist

- [ ] `status`를 `archived`로 변경했다.
- [ ] 파일을 `tasks/archive/`로 이동했다.
- [ ] 검증 결과를 이 문서에 기록했다.
- [ ] 필요한 공식 문서 업데이트를 완료했다.
- [ ] 관련 CE/REQ evidence 또는 follow-up을 기록했다.
