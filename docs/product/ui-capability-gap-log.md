---
title: UI Capability Gap Log
status: active
---

# UI Capability Gap Log

이 문서는 UI가 먼저 노출하지만 backend/API/domain 기능이 아직 따라오지 않은 제품 gap을 추적한다.
`DESIGN.md` 기반 UI refresh는 editor-first 제품 구조를 먼저 세울 수 있지만, 기능이 없는 UI가 완료된
기능처럼 보이면 안 된다.

## 기록 규칙

- UI placeholder는 사용자가 기능 미완성 상태를 알 수 있어야 한다.
- Placeholder는 실제 저장, 권한 변경, 초대, 삭제, billing, audit 같은 부작용을 수행하는 것처럼 보이면 안 된다.
- UI 작업자가 backend/API/domain gap을 발견하면 server code를 수정하지 않고 이 문서에 기록한다.
- 각 gap은 owner requirement 또는 follow-up task 후보를 함께 적는다.
- gap이 구현되면 related task/archive evidence를 남기고 항목을 닫는다.

## Gap Items

| ID         | Surface                   | Placeholder behavior                                                      | Missing capability                                                                     | Follow-up owner                                                                                              | Status |
| ---------- | ------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| UI-GAP-001 | Profile menu / settings   | Workspace, Project, User settings entry may route to scoped placeholders. | Full settings persistence and account/workspace management UX.                         | `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT` | open   |
| UI-GAP-002 | Workspace/member controls | UI may show disabled or explanatory controls for add/edit/remove flows.   | Complete workspace/member lifecycle implementation and authorization-backed mutations. | `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`                                      | open   |
