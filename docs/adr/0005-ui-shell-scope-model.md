---
id: ADR-0005
title: "ADR-0005: UI shell은 에디터 우선 범위를 유지한다"
status: accepted
date: 2026-04-28
authors:
  - nerdchanii
decision_type: product-architecture
tags:
  - ui-shell
  - scope-model
  - collaboration-ux
  - information-architecture
related_requirements:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-EDITOR-RICH-SOURCE-SPLIT
  - REQ-PROPERTIES-OUTSIDE-BODY
  - REQ-MARKDOWN-EXPORT-FRONTMATTER
  - REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN
  - REQ-WORKSPACE-HIERARCHY
  - REQ-DOCUMENT-STATE-FOUNDATION
related_documents:
  - subject.md
  - DESIGN.md
  - docs/product/README.md
  - docs/domain/README.md
  - docs/adr/0007-rich-markdown-authoring-surface.md
supersedes: []
superseded_by: null
partially_superseded_by: ADR-0013
---

# ADR-0005: UI shell은 에디터 우선 범위를 유지한다

> **부분 대체 (2026-09-25)**
>
> - ADR-0013 이 "기본 editor surface 는 TipTap Rich Markdown authoring" 조항을 대체한다. `markdown` 타입은 CodeMirror 6 라이브 프리뷰로 편집한다.
> - editor-first shell 범위에 대한 나머지 결정은 유효하다.

## 맥락

제품은 실시간 협업, presence, history, rich preview, workspace context, properties, links/backlinks, DocumentState foundation을 한 화면 흐름에서 다룬다. 중심 경험은 collaborative Markdown editor이므로 UI는 에디터 우선이어야 한다.

## 결정

UI shell은 다음 scope를 분리한다.

- Editor 범위: Markdown body, cursor/selection, mode, preview, sync state.
- Document 범위: title, properties, links/backlinks, checkpoint/history, DocumentState.
- Workspace 범위: workspace/project/folder/document navigation.
- User/member 범위: user, membership, presence identity, local sample identity.

기본 화면은 left workspace panel, center editor/preview, right inspector를 가진다. Properties는 title 근처에 두며, Markdown export는 frontmatter representation을 사용한다.

ADR-0007 이후 기본 editor surface는 TipTap 기반 Rich Markdown authoring이다. Raw Markdown source editor와 source/preview Split mode는 보류한다. 여러 workspace document를 center editor area에서 split/tab으로 동시에 여는 IDE-style multi-pane workspace는 향후 확장 가능성을 남긴다.

Workflow/dashboard 중심 화면은 deferred다. `DocumentState`는 editor-first shell 안에서 직접 변경 가능한 foundation으로 노출할 수 있지만, workflow executor, transition guard, publish/draft visibility, ownership-based visibility는 workflow capability가 승격될 때 결정한다.

> **승격 (2026-09-26)**: workflow executor 와 transition guard 는 [ADR-0017](0017-document-workflow-triggers-and-executor.md)(accepted)로 승격되었다. publish/draft visibility 와 ownership-based visibility 는 여전히 보류다.

## 후보안

### 1. Editor-first scope shell

- 장점: 협업 편집 기능 흐름이 명확하다.
- 단점: deferred workflow 기능을 과하게 드러내지 않도록 조정해야 한다.
- 리스크: inspector가 기능 dumping ground가 될 수 있다.

### 2. 단일 editor-only 화면

- 장점: 가장 빠르게 편집 화면을 만들 수 있다.
- 단점: workspace/product context와 history/properties가 뒤섞인다.
- 리스크: 자유영역 선택 근거가 약해진다.

### 3. workflow/dashboard 중심 화면

- 장점: PM/개발협업 확장성이 잘 보인다.
- 단점: editor-first 작성 흐름이 부차적으로 밀린다.
- 리스크: 사용자가 첫 화면에서 작성 맥락을 찾기 어려워진다.

## 선택 근거

UI는 editor-first 작성 흐름을 먼저 보여줘야 한다. Workspace와 workflow foundation은 editor를 지탱하는 context로 배치하고, deferred 기능이 core editor를 압도하지 않게 한다.

## 결과

### 긍정적 영향

- 협업 편집, presence, history, rich authoring을 한 화면 흐름에서 이해하기 쉽다.
- properties, history, links, DocumentState가 서로 다른 scope로 설명된다.
- design rules와 domain rules가 연결된다.

### 부정적 영향 또는 트레이드오프

- shell 설계가 단순 editor보다 복잡하다.
- local sample identity가 account/session UI와 혼동되지 않게 해야 한다.

### 후속 작업

- DESIGN.md에 맞춰 editor-first UI를 구현한다.
- deferred features는 backlog에 유지한다.
- auth/authorization은 별도 결정 전까지 scope를 넓히지 않는다.

## 검증 방법

- first screen이 실제 editor workspace인지 확인한다.
- presence, history, preview, sync state가 editor flow를 방해하지 않는지 확인한다.
- properties와 frontmatter export 정책이 혼동되지 않는지 확인한다.

## 관련 문서

- `DESIGN.md`
- `docs/product/README.md`
- `docs/product/editor/markdown-export.md`
- `docs/product/workflow/document-state.md`

## 변경 이력

| 날짜 | 변경 내용 | 결정자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | nerdchanii |
| 2026-04-28 | editor-first shell, frontmatter export, DocumentState foundation에 맞게 정리 | nerdchanii |
| 2026-04-29 | TF architecture review에 따라 accepted로 승격하고 workflow/dashboard deferred 원칙 명시 | nerdchanii |
| 2026-04-30 | ADR-0007에 맞춰 CE-05 source/split policy를 rich authoring surface 중심으로 갱신 | nerdchanii |
| 2026-09-27 | workflow executor 와 transition guard 가 ADR-0017 로 승격되었다는 표시 추가 | user |
