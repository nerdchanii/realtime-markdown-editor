---
title: docs/backlog/README.md
status: active
---

# docs/backlog/README.md

## 목적

Backlog는 first subject skeleton으로 오해하면 안 되는 보류 요청, 기능 아이디어, 비기능 작업, research prompt를 보관한다.

## 보류 항목

| 항목 | 미룬 이유 | 재검토 시점 |
| --- | --- | --- |
| Markdown body에서 task extraction | CE skeleton보다 제품 범위가 커진다. | CE-01부터 CE-05 skeleton이 안정화된 뒤. |
| `@owner`, `#tag`, `due:YYYY-MM-DD` parsing | Task extraction strategy에 의존한다. | Task extraction이 선택된 뒤. |
| Comments와 suggestions | CRDT anchor와 stale-anchor policy가 필요하다. | Collaboration engine 선택 후 basic history가 동작한 뒤. |
| Quick chat, mention, notification, DM | 커뮤니케이션 workflow가 editor-first 제품을 압도할 수 있다. | Core collaboration과 review surface가 안정화된 뒤. |
| Wikilink | Standard Markdown links/backlinks가 먼저다. | Standard link resolution과 export가 안정화된 뒤. |
| IDE-style multi-pane document workspace | 여러 workspace document를 center editor area에서 split/tab으로 동시에 여는 기능은 CE skeleton보다 UI/session/collaboration scope가 크다. | CE-01부터 CE-05와 basic workspace/document navigation이 안정화된 뒤 workspace presence/follow 확장과 비교 검토한다. |
| 전체 workspace offline cache | CE-03 open-page offline path보다 비용이 크다. | Open-page offline merge가 안정화된 뒤. |
| Property template과 inheritance | 반복적인 property 사용 evidence가 필요하다. | Basic properties가 검증된 뒤. |
| Workflow hooks와 visual builder | `DocumentState` foundation이 먼저 필요하다. | DocumentState가 안정화되고 CE skeleton이 완료된 뒤. |
| Slack, Agent, mail, logging hook | 연동 범위가 first skeleton보다 크다. | Workflow hook model이 설계된 뒤. |
| Tauri/Electron/PWA packaging | 플랫폼 범위가 web editor skeleton을 흐릴 수 있다. | Web skeleton과 adapter boundary가 안정화된 뒤. |
| Production auth provider와 account management | Seeded reviewer membership으로 CE evidence를 검증하고 production identity는 별도 보안/운영 결정이 필요하다. | CE recovery가 끝나고 authorization/RBAC 범위를 ADR로 승격할 때. |
| Production workspace/folder CRUD persistence | Reviewer-local document creation은 entrypoint smoke path이고 durable CRUD는 domain/API/storage contract 확대가 필요하다. | Workspace hierarchy UX와 document create smoke path가 안정화된 뒤. |

## 규칙

Backlog item을 승격하려면 requirements, product docs, 관련 ADR을 함께 업데이트해야 한다. 보류 항목을 조용히 승격하지 않는다.
