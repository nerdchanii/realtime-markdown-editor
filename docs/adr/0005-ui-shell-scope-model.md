---
id: ADR-0005
title: "ADR-0005: UI shell은 에디터 우선 범위를 유지한다"
status: proposed
date: 2026-04-28
authors:
  - Codex
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
supersedes: []
superseded_by: null
---

# ADR-0005: UI shell은 에디터 우선 범위를 유지한다

## 맥락

제품은 실시간 협업, presence, history, rich preview, workspace context, properties, links/backlinks, DocumentState foundation을 한 화면 흐름에서 다룬다. 그러나 과제의 핵심은 collaborative Markdown editor이므로 UI는 에디터 우선이어야 한다.

## 결정

UI shell은 다음 scope를 분리한다.

- Editor 범위: Markdown body, cursor/selection, mode, preview, sync state.
- Document 범위: title, properties, links/backlinks, checkpoint/history, DocumentState.
- Workspace 범위: workspace/project/folder/document navigation.
- User/member 범위: user, membership, presence identity, reviewer/mock identity.

기본 화면은 left workspace panel, center editor/preview, right inspector를 가진다. Properties는 title 근처에 두며, Markdown export는 frontmatter representation을 사용한다.

## 후보안

### 1. Editor-first scope shell

- 장점: CE-01~CE-05 검증 흐름이 명확하다.
- 단점: deferred workflow 기능을 과하게 드러내지 않도록 조정해야 한다.
- 리스크: inspector가 기능 dumping ground가 될 수 있다.

### 2. 단일 editor-only 화면

- 장점: 가장 빠르게 편집 화면을 만들 수 있다.
- 단점: workspace/product context와 history/properties가 뒤섞인다.
- 리스크: 자유영역 선택 근거가 약해진다.

### 3. workflow/dashboard 중심 화면

- 장점: PM/개발협업 확장성이 잘 보인다.
- 단점: CE editor skeleton이 부차적으로 밀린다.
- 리스크: 과제 검증 경로가 복잡해진다.

## 선택 근거

UI는 CE walking skeleton을 먼저 증명해야 한다. Workspace와 workflow foundation은 editor를 지탱하는 context로 배치하고, deferred 기능이 core editor를 압도하지 않게 한다.

## 결과

### 긍정적 영향

- CE-01~CE-05를 한 화면 흐름에서 검증하기 쉽다.
- properties, history, links, DocumentState가 서로 다른 scope로 설명된다.
- design rules와 domain rules가 연결된다.

### 부정적 영향 또는 트레이드오프

- shell 설계가 단순 editor보다 복잡하다.
- account switcher/mock identity 같은 reviewer support가 product auth로 오해되지 않게 해야 한다.

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

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | 최초 작성 | Codex |
| 2026-04-28 | editor-first shell, frontmatter export, DocumentState foundation에 맞게 정리 | Codex |
