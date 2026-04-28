# Traceability

이 문서는 필수 과제 요구사항, 인터뷰 기반 제품 요구사항, feature capability 사이의 추적 구조를 제공한다. 상세 요구사항 필드는 `registry.md`를 기준으로 한다.

## Subject Requirement Coverage

| Subject ID | Registry ID | Feature | Coverage |
| --- | --- | --- | --- |
| CE-01 | CE-01 | F-COLLAB, F-WORKSPACE | workspace document 단위의 실시간 공동 편집으로 추적 |
| CE-02 | CE-02 | F-PRESENCE, F-IDENTITY | User와 WorkspaceMembership 기반 presence로 추적 |
| CE-03 | CE-03 | F-OFFLINE-SYNC | IndexedDB local persistence와 재동기화로 추적 |
| CE-04 | CE-04 | F-HISTORY | explicit user message를 가진 checkpoint/history로 추적 |
| CE-05 | CE-05 | F-RICH-EDITOR, F-MARKDOWN-IO | Rich default, Markdown source, Split view로 추적 |
| Sync decision ADR | ARCH-01, ARCH-03, RES-01 | F-ENGINE-POC | 동기화 방식 선택 근거와 rich editor POC 요구사항으로 추적 |
| Deliverables | OPS-01, OPS-02, OPS-03 | F-LOCAL-SETUP | 제출 산출물, README, 자유 영역 근거 문서화로 추적 |

## Product Capability Coverage

| Feature ID | Requirement IDs | Notes |
| --- | --- | --- |
| F-WORKSPACE | FR-01, UX-01, ARCH-08, CE-01 | B2B SaaS 도메인과 Workspace > Project > Folder > Document 계층 |
| F-IDENTITY | FR-02, FR-03, UX-02, OPS-02 | User와 WorkspaceMembership, seeded users, account switcher |
| F-COLLAB | CE-01, NFR-01, NFR-02 | workspace document 공동 편집 |
| F-PRESENCE | CE-02, UX-02, NFR-02 | membership 기반 커서와 선택 영역 표시 |
| F-OFFLINE-SYNC | CE-03, FR-11, FR-12, NFR-04, UX-07, ARCH-06, BL-05 | IndexedDB, PWA app shell, 최근 문서 캐시 |
| F-HISTORY | CE-04, FR-05, FR-06, ARCH-04 | autosave/save와 구분되는 explicit checkpoint/history |
| F-RICH-EDITOR | CE-05, FR-04, UX-09, ARCH-03, RES-01 | Rich default, Markdown source, Split view |
| F-PROPERTIES | FR-07, FR-10, UX-05, ARCH-07, RES-04, BL-06 | Markdown body 밖의 metadata/properties와 future templates |
| F-LINKS | FR-08, FR-09, ARCH-09, BL-04 | 표준 Markdown link, backlink, export, wikilink backlog |
| F-MARKDOWN-IO | CE-05, FR-04, FR-08, FR-09, ARCH-07, ARCH-09 | Markdown source view와 표준 Markdown export |
| F-UI-SHELL | FR-12, UX-01, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08 | 3-panel shell, foldable sides, ToC rail, properties, inspector, i18n |
| F-I18N | UX-08 | ko/en UI support from the start |
| F-STORAGE | FR-06, FR-11, ARCH-04, ARCH-05, ARCH-06, RES-02 | Postgres/RDB, MinIO/object storage, IndexedDB, optional Redis |
| F-ENGINE-POC | ARCH-01, ARCH-02, ARCH-03, RES-01, NFR-01 | 협업 엔진 선택과 도메인 격리 |
| F-COMMENTS | RES-03, BL-03 | comment, suggestion, chat, mention, notification, DM backlog/research |
| F-TASK-EXTRACTION | BL-01, BL-02 | task extraction과 task metadata parsing backlog |
| F-LOCAL-SETUP | OPS-01, OPS-02, OPS-03, NFR-03 | 채점자 실행과 공식 문서 독립성 |
| F-BACKLOG | BL-01, BL-02, BL-03, BL-04, BL-05, BL-06, RES-04 | MVP 제외 또는 후속 검토 항목 |

## Preliminary Dependency Notes

- CE-01은 단일 기본 문서가 아니라 workspace document 모델 위에서 검증한다.
- CE-02는 임시 프로필이 아니라 User와 WorkspaceMembership을 기준으로 검증한다.
- CE-03은 IndexedDB local persistence와 최근 문서 캐시 정책을 포함한다.
- CE-04는 autosave/save와 checkpoint를 구분하고 checkpoint에는 explicit user message가 있어야 한다.
- CE-05는 preview만이 아니라 Rich default, Markdown source, Split view editor mode로 확장해 검증한다.
- FR-08과 FR-09는 wikilink보다 표준 Markdown link와 export portability를 우선한다.
- ARCH-05는 Postgres/RDB와 MinIO/object storage를 durable baseline으로 두며 Redis는 RES-02의 선택적 연구 항목이다.

## Conflict Review Placeholder

현재 등록된 요구사항에서 확정된 충돌은 없다. 다만 다음 세션에서 다음 관점을 별도로 검토해야 한다.

- phased MVP가 workspace 계층을 얼마나 화면과 데이터 모델에 드러낼지.
- Rich editor 내부 문서 모델과 표준 Markdown export 사이의 손실 가능성.
- properties를 body 밖에 둘 때 Markdown export에 properties를 포함할지, 별도 artifact로 둘지.
- recent document offline cache의 범위와 사용자가 기대하는 offline availability 사이의 차이.
- comment/suggestion anchor 정책이 선택한 협업 엔진의 CRDT 모델과 맞는지.
