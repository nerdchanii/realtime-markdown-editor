---
title: docs/requirements/registry.md
status: active
schema_version: 0.1.0
---

# docs/requirements/registry.md

이 파일은 상세 요구사항 정본이 아니라 사람이 보는 얇은 지도다. 상세 내용은
`completed/*.md`, `items/*.md`, `backlog/*.md`의 ID별 파일에 둔다.

## 분류 원칙

요구사항은 제품 기능과 사용자 흐름을 추적하기 위한 내부 지도다. auth, membership, workspace
lifecycle, data integrity, UX clarity는 협업 Markdown 제품을 구성하는 기능 영역이며, "확장"이라는
이유로 사용자 흐름에서 분리하지 않는다. 요구사항 category는 구현 순서를 돕는 metadata다.

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
- `REQ-COLLABORATIVE-CREATION-VISIBILITY`
- `REQ-DOCUMENT-STATE-FOUNDATION`
- `REQ-DOCUMENT-TRASH-RESTORE`
- `REQ-EDITOR-RICH-AUTHORING-SURFACE`
- `REQ-HISTORY-AUTOSAVE-SEPARATION`
- `REQ-HISTORY-CHECKPOINTS`
- `REQ-IDENTITY-MEMBERSHIP`
- `REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN`
- `REQ-MARKDOWN-EXPORT-FRONTMATTER`
- `REQ-MARKDOWN-PORTABILITY`
- `REQ-OFFLINE-INDEXEDDB-DRAFT-RECOVERY`
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

- `REQ-CE-ACCEPTANCE-TEST-DECOUPLING`
- `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`
- `REQ-EDITOR-FIRST-UI-REFRESH`
- `REQ-PLATFORM-PORTABILITY-GUARDRAIL`
- `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`
- `REQ-RESEARCH-REDIS-SUPPORT`
- `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`
- `REQ-WORKSPACE-MEMBER-MANAGEMENT`

이 중 `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`, `REQ-WORKSPACE-MEMBER-MANAGEMENT`,
`REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`는 계정과 워크스페이스를 사용자 흐름으로 연결하는 제품
요구사항이다. 이 요구사항이 없으면 협업 편집 기능은 문서 작업 흐름과 분리된다.

## 백로그 요구사항

아직 계획되거나 구체화되지 않은 요구사항은 `docs/requirements/backlog/`에 둔다.
여기에 있는 항목은 바로 구현 지시로 쓰지 않고 `next_step`을 먼저 해결한다.

- `REQ-ACCOUNT-WORKSPACE-ONBOARDING`
- `REQ-PRODUCT-DEMO-ENTRYPOINT`
- `REQ-WORKSPACE-INVITATION-INBOX`
