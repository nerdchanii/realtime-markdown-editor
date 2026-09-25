---
id: ADR-0013
title: "ADR-0013: 문서는 타입을 가지며, 첫 타입은 Markdown 텍스트가 정본인 markdown 문서다"
status: accepted
date: 2026-09-25
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-25
reversibility: one-way
revisit_if: >-
  라이브 프리뷰 편집 경험이 기존 WYSIWYG 보다 크게 나쁘거나, 블록 기반 서식 문서 수요가 커지면
  rich-text 타입 도입 시점을 다시 본다.
related_documents:
  - docs/direction/2026-09-24-product-direction-interview.md
  - docs/adr/0007-rich-markdown-authoring-surface.md
  - docs/adr/0011-data-authority-by-scope.md
  - docs/adr/0012-authorization-policy-and-principals.md
supersedes:
  - ADR-0007
  - ADR-0002 (editor integration 항목만. Yjs 와 Hocuspocus 결정은 유지)
superseded_by: null
---

# ADR-0013: 문서는 타입을 가지며, 첫 타입은 Markdown 텍스트가 정본인 markdown 문서다

> **accepted (2026-09-25)**. 에이전트가 비교안과 추천안을 작성했고, 사용자가 선택했다. 추적 Issue: #5
>
> 추천안과 다르게 결정된 항목이 있다. 에이전트는 서식 트리(XmlFragment)를 정본으로, rich-text 를 첫 타입으로
> 추천했다. 사용자는 **Markdown 텍스트를 정본으로, markdown 을 첫 타입으로** 선택했다.

## 맥락

### 사용자 의도 (인터뷰 §2)

- [user] Markdown 은 **여러 문서 타입 중 하나**가 된다.
- [user] 텍스트 편집의 깊이, 블록과 속성, 다양한 편집 대상(코드, 캔버스, 표)을 모두 포기하지 않는다.
- [user] 제품은 사람과 에이전트가 함께 편집하는 ADE 표면이다. 로컬 파일 연동은 나중에 한다.

### 이미 확정된 제약

- ADR-0011(accepted)이 정한 규칙이 있다.
  - 문서 편집 상태의 write 정본은 Yjs document 다.
  - **한 문서의 본문 정본은 Yjs 안에서 하나의 표현만 가진다.**

### 현재 구현 (코드 확인)

- `Document` 에 타입 개념이 없다.
- **본문이 Yjs 안에 두 가지 형태로 들어 있다.**
  - Tiptap 이 쓰는 XmlFragment `"default"`
  - client 가 편집마다 복제하는 `Y.Text "markdown"`
  - 서버는 `Y.Text` 에만 bootstrap 한다.
- checkpoint, export, link 추출은 모두 `markdownBody`(Markdown 문자열)를 소비한다.
- 편집 화면은 Tiptap v3 WYSIWYG 이다(ADR-0007).

## 결정

### 1. 문서 타입 모델 — [user] 채택

- **`Document.type`**
  - 값은 `markdown`, `code`, 앞으로의 `rich-text`, `canvas`, `table` 등이다.
  - type 은 만들 때 정하고 바꾸지 않는다.
  - 다른 타입으로 바꾸는 것은 명시적인 "변환해서 새 문서 만들기"다.
- **Yjs 레이아웃**

  | Yjs 루트 | 담당 | 내용 |
  | --- | --- | --- |
  | `meta` (Y.Map) | core | title, properties, DocumentState. 모든 타입에 공통이다. |
  | `content` | 타입 | 본문. markdown 과 code 는 `Y.Text` 다. 앞으로의 rich-text 는 Y.XmlFragment, canvas 와 table 은 Y.Map/Y.Array 다. |

- **core 가 제공하는 것**: 권한(ADR-0012), sync 와 persistence, presence, history 와 checkpoint, 범위와 권위(ADR-0011), 목록과 트리.
  core 는 타입을 모른다.
- **type module 이 제공하는 것**
  - 에디터
  - `content` 스키마 버전과 migration
  - projection: `toText`, `toMarkdown`(가능한 타입만), `extractLinks`
- **projection 은 서버에서도 계산할 수 있어야 한다.** 브라우저 API 에 의존하지 않는다.

### 2. 본문 정본 표현 — [user] Markdown 텍스트

- `markdown` 타입의 `content` 는 **`Y.Text`(Markdown 문자열)가 유일한 정본**이다.
- 파일, git, 에이전트의 텍스트 도구(grep, diff, 텍스트 편집)와 가장 자연스럽게 맞는다.
- 로컬 파일 연동(ADR-0011 의 local 범위)에서는 파일 내용과 정본이 같은 형식이 된다.
- projection 이 단순해진다.
  - `toMarkdown` 은 그대로 반환한다.
  - 서버에 headless 에디터가 필요 없다.

### 3. 첫 타입 — [user] `markdown`

- **편집 화면 — [user] Obsidian 식 라이브 프리뷰**
  - CodeMirror 6 과 Yjs 바인딩(`y-codemirror.next`) 위에서 동작한다.
  - 서식을 인라인으로 렌더링한다. 커서가 있는 곳에서만 Markdown 기호가 드러난다.
  - remote cursor 와 selection 은 Yjs awareness 로 표시한다.
  - 편집 화면에 source 와 preview 가 따로 있지 않다. 라이브 프리뷰 하나가 기본 경험이다.
- **ADR-0007 을 대체한다.** 기존 결정은 Tiptap WYSIWYG 을 기본 편집 경험으로, raw source 를 보류로 두었다.
- **ADR-0002 는 부분만 대체한다.**
  - 대체되는 것: "Editor integration 은 Tiptap" 항목. markdown 과 code 타입의 editor integration 은 CodeMirror 6 다.
  - 유지되는 것: CRDT 는 Yjs, realtime sync server 는 Hocuspocus, provider 와 persistence 를 adapter 경계 뒤에 둔다는 결정.
  - 나중의 rich-text 타입은 Tiptap 을 다시 쓸 수 있다.

### 4. 두 번째 타입 — [user] 코드 (`code`)

- [user] "Markdown + 코드"를 선택했다. markdown 이 첫 타입이므로 두 번째는 `code` 다.
- `code` 는 markdown 과 **같은 엔진(`Y.Text` + CodeMirror 6)을 공유**한다. 언어 모드만 다르다.

### 5. rich-text(서식 문서) — [user] 보류

- 블록 기반 서식 문서는 나중에 **별도 타입**으로 다시 만든다.
- [agent] 그때 정본은 Y.XmlFragment 가 자연스럽지만, 그 타입을 설계할 때 정한다.
- 블록과 속성(사용자 의도 2)은 이 결정으로 포기하지 않는다.
  - properties 는 core `meta` 에서 모든 타입에 제공한다.
  - 블록 편집은 rich-text 타입이나 라이브 프리뷰 확장으로 다시 본다.

## 과거 요구사항 처리

- `RAW-MARKDOWN-SOURCE`, `SOURCE-SPLIT-PREVIEW`, `EDITOR-RICH-SOURCE-SPLIT`: markdown 타입과 라이브 프리뷰로 흡수된다.
- `WIKILINKS`, `METADATA-PARSING`, `TASK-EXTRACTION`: markdown 타입의 `extractLinks` 와 projection 확장이다. 파싱 대상이 정본 텍스트라서 구현이 단순해진다. markdown 타입을 구현할 때 다시 본다.
- `PROPERTY-TEMPLATES-INHERITANCE`: core `meta` 확장이다. 필요할 때 다시 본다.

## 결과

- **스키마**
  - `Document.type` 을 추가한다. 기존 문서를 `markdown` 으로 migration 한다.
  - `markdownBody` 는 server 범위의 projection 컬럼으로 남는다.
- **기존 Yjs state migration** — [agent] G1, `ratify_by: 2026-10-02`
  - 정본 `content`(`Y.Text`)는 다음 순서로 채운다.
    1. 사용자가 실제로 편집한 Tiptap XmlFragment 를 `@tiptap/markdown` 으로 직렬화한 결과. 가장 최신일 가능성이 높다.
    2. 1이 없으면 `Y.Text "markdown"`
    3. 2도 없으면 `markdownBody`
  - migration 이 끝나면 XmlFragment `"default"` 와 이전 `"markdown"` 루트를 제거한다.
  - 한 번만 실행하는 서버 측 migration 으로 수행한다. migration 전에 state 를 백업한다.
- **편집 화면 교체**
  - `features/editor` 의 Tiptap runtime 을 CodeMirror 6 라이브 프리뷰로 교체한다.
  - presence caret 은 CodeMirror awareness 로 옮긴다.
  - UI 변경이므로 #7(UI 원칙)과 함께 진행하고, 스크린샷 증거를 붙인다.
- **projection 경로 정리**
  - 서버가 `content.toString()` 으로 projection 한다.
  - client 가 Markdown 을 PUT 하는 경로(checkpoint 와 export 전 PUT)를 없앤다.
- **도메인 문서**: `docs/domain/` 에 `DocumentType`, `meta`/`content` 구조, projection 규칙을 반영한다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-25 | 최초 제안 (proposed). 추천은 XmlFragment 정본과 rich-text 첫 타입 | agent:claude-code |
| 2026-09-25 | Markdown 텍스트 정본, markdown 첫 타입, 라이브 프리뷰, 두 번째 타입 code, rich-text 보류로 accepted | user |
