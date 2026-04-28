# Feature Catalog

이 디렉터리는 실시간 마크다운 협업 에디터의 공식 feature catalog다. Feature는 구현 task가 아니라 사용자가 인지하는 제품 capability로 정의한다. 요구사항의 원본 필드는 `docs/requirements/registry.md`를 기준으로 하고, feature와 요구사항 간 추적은 `docs/requirements/traceability.md`와 함께 관리한다.

## Catalog Rules

- Feature ID는 이 catalog에서 관리하고, 요구사항 레지스트리는 `related_features` 필드로 해당 ID를 참조한다.
- 각 feature 문서는 목적, MVP 범위, 제외/후속 범위, 연결 요구사항, acceptance 요약, open questions/research를 포함한다.
- MVP에서 제외된 기능도 capability로 보존하되, backlog 또는 research 상태를 명확히 표시한다.
- 기능 간 dependency, blocker, contradiction의 전체 분석은 다음 요구사항 분석 세션에서 보강한다.

## Feature Index

| Feature ID | Capability | MVP Status | Spec |
| --- | --- | --- | --- |
| `F-WORKSPACE` | B2B workspace, project, folder, document hierarchy | MVP | [workspace](workspace/README.md) |
| `F-IDENTITY` | Seeded users and workspace membership | MVP | [identity](identity/README.md) |
| `F-COLLAB` | Realtime collaborative editing | MVP | [collaboration](collaboration/README.md) |
| `F-PRESENCE` | Member cursor and selection presence | MVP | [presence](presence/README.md) |
| `F-OFFLINE-SYNC` | IndexedDB offline editing and resync with minimal PWA shell | MVP | [offline-sync](offline-sync/README.md) |
| `F-HISTORY` | Checkpoint and history separate from autosave/save | MVP | [history](history/README.md) |
| `F-RICH-EDITOR` | Rich default, Markdown source, and Split editing modes | MVP | [rich-editor](rich-editor/README.md) |
| `F-PROPERTIES` | Document properties near title outside Markdown body | MVP | [properties](properties/README.md) |
| `F-LINKS` | Standard Markdown links, backlinks, and document connections | MVP | [links](links/README.md) |
| `F-MARKDOWN-IO` | Standard Markdown source and export | MVP | [markdown-io](markdown-io/README.md) |
| `F-UI-SHELL` | 3-panel product shell with contextual inspector | MVP | [ui-shell](ui-shell/README.md) |
| `F-I18N` | Korean and English UI resources | MVP | [i18n](i18n/README.md) |
| `F-STORAGE` | Durable metadata, artifacts, local persistence, and optional cache roles | MVP architecture | [storage](storage/README.md) |
| `F-ENGINE-POC` | Collaboration engine evaluation and adapter boundary | Research for MVP | [engine-poc](engine-poc/README.md) |
| `F-COMMENTS` | Comments, suggestions, mentions, notifications, quick chat, DM | Backlog/research | [comments](comments/README.md) |
| `F-TASK-EXTRACTION` | Task extraction and task metadata parsing | Backlog | [task-extraction](task-extraction/README.md) |
| `F-LOCAL-SETUP` | Local execution, submission, and reviewer-facing docs | MVP | [local-setup](local-setup/README.md) |
| `F-BACKLOG` | Explicitly deferred capabilities and reconsideration rules | Backlog governance | [backlog](backlog/README.md) |

## MVP Capability Shape

The MVP is a B2B team document editor rather than a personal note app. It uses a seeded workspace and seeded users to make collaboration testable without full account creation. The core surface is a 3-panel shell: workspace navigation on the left, editor in the center, contextual inspector on the right.

The editor supports Rich, Markdown source, and Split modes. Collaboration covers simultaneous editing, membership-based presence, offline local edits with IndexedDB-backed recovery, and checkpoint history with explicit user messages. Markdown portability remains a product constraint: document links and exports use standard Markdown first, while wikilinks and advanced collaboration communication features are deferred.

## Deferred Capability Shape

The following areas are intentionally not MVP capabilities:

- Task extraction from document body and task metadata parsing such as `@owner`, `#tag`, and `due:YYYY-MM-DD`.
- Comments, suggestions, mentions, notifications, quick chat, and direct messages.
- Wikilinks before standard Markdown link, backlink, and export behavior is reliable.
- Whole-workspace or whole-vault offline cache before recent-document offline behavior is validated.
- Property templates and inheritance before basic document properties are proven useful.
