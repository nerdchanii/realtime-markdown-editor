---
id: ADR-0007
title: "ADR-0007: Rich Markdown authoring surface를 기본 에디터로 채택한다"
status: accepted
date: 2026-04-30
authors:
  - nerdchanii
decision_type: product-architecture
tags:
  - editor
  - markdown
  - tiptap
  - rich-preview
related_requirements:
  - CE-05-RICH-PREVIEW
  - REQ-EDITOR-RICH-AUTHORING-SURFACE
  - REQ-MARKDOWN-PORTABILITY
related_documents:
  - subject.md
  - DESIGN.md
  - docs/compliance/subject-matrix.md
  - docs/product/editor/rich-preview.md
supersedes: []
superseded_by: null
---

# ADR-0007: Rich Markdown authoring surface를 기본 에디터로 채택한다

## 맥락

과제 원문은 여러 사용자가 하나의 Markdown 문서를 실시간으로 함께 편집하고 Markdown rich preview를 제공해야 한다고 요구한다. 그러나 raw Markdown source view나 source/preview split view를 필수 UI로 요구하지는 않는다.

현재 제품 목표는 reviewer가 첫 화면에서 협업 문서를 실제 제품처럼 편집한다고 느끼는 것이다. `textarea` 기반 source editor를 기본 경로로 두면 TipTap 선택 근거와 rich collaboration 경험이 약해진다. 반대로 TipTap `EditorContent`는 Markdown shortcut, keyboard shortcut, collaboration cursor, rich-rendered document editing을 한 surface에서 제공한다.

## 결정

First submission의 editor surface는 TipTap `EditorContent` 기반 Rich Markdown authoring을 기본이자 중심 편집 경험으로 둔다.

- Raw Markdown source editor는 first submission 범위에서 보류한다.
- Source + rendered preview Split mode는 first submission 범위에서 보류한다.
- 별도 rendered preview pane은 필수 CE path에서 제외한다.
- CE-05는 TipTap rich editor가 Markdown 문서를 rich-rendered 상태로 직접 편집하게 하는 것으로 충족한다.
- Markdown portability는 `@tiptap/markdown` round-trip, Markdown export, revision snapshot, e2e 검증으로 증명한다.

## 후보안

### 1. Raw Markdown source + rendered preview split

- 장점: Markdown source를 직접 볼 수 있어 source fidelity 설명이 쉽다.
- 단점: 기본 편집면이 `textarea`처럼 보이면 제품 완성도와 TipTap 선택 근거가 약해진다.
- 리스크: source editor 고도화를 위해 CodeMirror 같은 별도 editor stack이 필요해 first submission 범위가 커진다.

### 2. TipTap rich editor + 별도 rendered preview

- 장점: 편집면과 read-only output surface를 분리할 수 있다.
- 단점: Rich editor 자체가 이미 rendered document에 가까워 같은 정보를 중복 표시한다.
- 리스크: preview pane이 editor-first 화면 밀도를 낮추고 reviewer가 실제 편집 경로를 혼동할 수 있다.

### 3. TipTap rich authoring surface

- 장점: collaboration, shortcuts, Markdown parsing/serialization, rendered authoring을 하나의 제품 경로로 묶는다.
- 단점: raw Markdown source를 화면에서 직접 확인하는 escape hatch는 없다.
- 리스크: Markdown editor임을 UI raw source가 아니라 export/history/test evidence로 설명해야 한다.

## 선택 근거

Notion, Dropbox Paper, Linear 문서형 surfaces처럼 편집면 자체가 최종 문서에 가까운 rich-rendered view인 제품은 별도 preview 없이도 authoring과 preview를 결합한다. 이 제품도 Markdown source를 항상 노출하기보다, Markdown body를 portable artifact로 유지하면서 사용자는 rich-rendered collaborative editor를 직접 편집하게 한다.

TipTap Markdown extension은 raw source UI가 아니라 Markdown 문자열과 TipTap document model을 왕복하는 bridge다. 따라서 TipTap을 핵심 editor로 선택한 이상, first submission은 raw source editor보다 TipTap authoring surface 품질을 우선한다.

## 결과

### 긍정적 영향

- 첫 화면이 실제 collaborative rich editor로 보인다.
- CE-01, CE-02, CE-03, CE-05가 같은 TipTap surface에서 검증된다.
- raw source/split 구현 때문에 editor UX가 분산되지 않는다.

### 부정적 영향 또는 트레이드오프

- Markdown source를 직접 편집하는 기능은 first submission에서 제공하지 않는다.
- CE-05 증거는 Split view가 아니라 rich authoring surface와 Markdown round-trip evidence로 바뀐다.
- 기존 `REQ-EDITOR-RICH-SOURCE-SPLIT` 문서는 deferred 요구로 내려야 한다.

### 후속 작업

- Raw Markdown source editor가 필요해지면 CodeMirror 같은 OSS text editor를 별도 검토한다.
- Source/preview split은 reviewer feedback이나 user evidence가 생긴 뒤 backlog에서 승격한다.
- Diff는 TipTap Pro Snapshot Compare가 아니라 OSS Markdown diff부터 검토한다.

## 검증 방법

- TipTap rich editor에서 heading, list, inline code, link 같은 Markdown authoring shortcuts가 rich-rendered content로 동작한다.
- 두 명 이상이 같은 rich editor surface에서 편집하고 수렴한다.
- Markdown export와 revision snapshot이 현재 editor content를 standard Markdown body로 보존한다.

## 관련 문서

- `subject.md`
- `docs/compliance/subject-matrix.md`
- `docs/requirements/registry.md`
- `docs/product/editor/rich-preview.md`
- `DESIGN.md`

## 변경 이력

| 날짜 | 변경 내용 | 결정자 |
| --- | --- | --- |
| 2026-04-30 | 최초 작성 | nerdchanii |
