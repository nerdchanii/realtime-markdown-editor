---
title: docs/requirements/registry.md
status: active
schema_version: 0.1.0
---

# docs/requirements/registry.md

이 파일은 상세 요구사항 정본이 아니라 사람이 보는 얇은 지도다. 상세 내용은
`completed/*.md`, `items/*.md`, `backlog/*.md`의 ID별 파일에 둔다.

## 분류 원칙

CE 요구사항은 과제 요구사항을 사용자 행동 단위로 묶은 product stories다. 제품으로서 자연스럽게
필요한 auth, membership, workspace lifecycle, data integrity, UX clarity는 각 story를 제품으로
성립시키는 세부 요구사항이며, "확장"이라는 이유로 낮은 우선순위가 되지 않는다.
요구사항 category는 구현 순서를 돕는 metadata이며, 제품 품질 gate를 우회하는 근거가 될 수 없다.

상태/범위/타입별 조회는 스크립트를 사용한다.

```sh
node scripts/requirements-index.mjs
node scripts/requirements-index.mjs --status done
node scripts/requirements-index.mjs --category backlog
node scripts/requirements-index.mjs --scope frontend
```

## 완료된 요구사항

완료된 항목은 `docs/requirements/completed/`에 둔다. 이 디렉터리는 "이미 작업한 것"의
정본이다.

- `CE-01-CONCURRENT-EDITING`
- `CE-02-PRESENCE`
- `CE-03-OFFLINE-MERGE`
- `CE-04-REVISION-HISTORY`
- `CE-05-RICH-PREVIEW`
- `REQ-COLLAB-ENGINE-ADAPTER`
- `REQ-DOCUMENT-STATE-FOUNDATION`
- `REQ-EDITOR-RICH-AUTHORING-SURFACE`
- `REQ-HISTORY-AUTOSAVE-SEPARATION`
- `REQ-HISTORY-CHECKPOINTS`
- `REQ-IDENTITY-MEMBERSHIP`
- `REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN`
- `REQ-MARKDOWN-EXPORT-FRONTMATTER`
- `REQ-MARKDOWN-PORTABILITY`
- `REQ-OFFLINE-LOCAL-PERSISTENCE`
- `REQ-OFFLINE-RECONNECT-MERGE`
- `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`
- `REQ-PRESENCE-MEMBER-AWARENESS`
- `REQ-PROPERTIES-OUTSIDE-BODY`
- `REQ-RESEARCH-COLLAB-ENGINE-POC`
- `REQ-WORKSPACE-DOCUMENT-SCOPE`
- `REQ-WORKSPACE-HIERARCHY`

## 채택되었지만 아직 닫지 않은 요구사항

진행 중이거나 guardrail로 유지되는 항목은 `docs/requirements/items/`에 둔다.

- `REQ-COLLABORATIVE-CREATION-VISIBILITY`
- `REQ-CE-ACCEPTANCE-TEST-DECOUPLING`
- `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`
- `REQ-DOCUMENT-TRASH-RESTORE`
- `REQ-EDITOR-FIRST-UI-REFRESH`
- `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY`
- `REQ-PLATFORM-PORTABILITY-GUARDRAIL`
- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`
- `REQ-RESEARCH-REDIS-SUPPORT`
- `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`
- `REQ-WORKSPACE-MEMBER-MANAGEMENT`

이 중 `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`,
`REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`는 CE stories가 실제 사용자에게 성립하기 위한 세부 제품
요구사항이다. 이 요구사항 없이 CE 동작만 보인다면 제품 완료가 아니라 미완성 story path로 기록한다.

## 백로그 요구사항

아직 계획되거나 구체화되지 않은 요구사항은 `docs/requirements/backlog/`에 둔다.
여기에 있는 항목은 바로 구현 지시로 쓰지 않고 `next_step`을 먼저 해결한다.

- `REQ-ACCOUNT-WORKSPACE-ONBOARDING`
- `REQ-PRODUCT-DEMO-ENTRYPOINT`
- `REQ-WORKSPACE-INVITATION-INBOX`
