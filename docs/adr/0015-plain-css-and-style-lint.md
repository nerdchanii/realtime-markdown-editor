---
id: ADR-0015
title: "ADR-0015: 스타일은 plain CSS 와 token 으로 쓰고, 규칙은 AST lint 와 설정 override 로만 강제한다"
status: accepted
date: 2026-09-26
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-26
reversibility: two-way
revisit_if: 규칙이 15개를 넘거나 여러 앱으로 퍼지면 스타일 헌법(기계 판독 규칙 파일)을 다시 본다. lint 가 정당한 스타일을 반복해서 막으면 해당 규칙을 다시 본다.
related_documents:
  - docs/adr/0014-ui-principles.md
  - docs/adr/0013-document-type-model.md
  - DESIGN.md
supersedes: []
superseded_by: null
---

# ADR-0015: 스타일은 plain CSS 와 token 으로 쓰고, 규칙은 AST lint 와 설정 override 로만 강제한다

> **accepted (2026-09-26)**. 에이전트와 advisor 가 선택지를 비교했고, 사용자가 결정했다. 추적 Issue: [#13](https://github.com/nerdchanii/realtime-markdown-editor/issues/13)

## 맥락

- ADR-0014 는 "요소를 border 박스로 감싸지 않는다", "색은 token 으로만 쓴다"를 정했다.
- PR #12 에서 정규식 lint 로 이를 강제하려 했지만, 리뷰마다 새 우회 경로가 나왔다.
  - [user] "정규식 lint 는 효과가 없다."
- [user] border 는 필요할 때 쓸 수밖에 없다. border 를 넣는 레이어를 최소화하는 것이 목표다.
- 현재 스타일 상태(2026-09-26):
  - `global.css` 에 token 82개, Tailwind `@apply` 40개가 있다. 나머지는 semantic class 에 쓴 CSS 다.
  - TSX 는 semantic class 만 쓴다. Tailwind utility 는 쓰지 않는다.
  - SCSS 는 Tiptap 템플릿 컴포넌트와 전역 partial 에만 있다. Tiptap 은 ADR-0013 에 따라 CodeMirror 로 바뀐다.
  - inline `style` 은 23개 파일에 223곳 있다.

## 결정

### 1. 스타일 방식 — [user] plain CSS + custom property token

- 스타일은 semantic class 에 plain CSS 로 쓴다. 테마 값은 CSS custom property(token)로 쓴다.
- **SCSS 는 새로 쓰지 않는다.**
  - mixin 과 `@include` 는 lint 가 안쪽 선언을 보지 못하는 맹점이다.
  - `$변수` 는 컴파일할 때 값이 고정되어 다크/라이트 전환을 따르지 않는다.
  - 기존 SCSS 는 Tiptap 과 함께 제거한다.
- **Tailwind utility class 는 TSX 에서 쓰지 않는다.** 기존 `@apply` 는 plain CSS 로 옮겨 가며 줄인다.
- inline `style` 은 CSS custom property(`--name`)를 넘기는 용도로만 쓴다.

### 2. border 허용 레이어 — [user] 두 파일로 한정

- 레이아웃 CSS(`apps/web/src/layouts/**/*.css`): 패널 경계선만 허용한다. 한쪽 변, `1px`, token 색이어야 한다.
- 에디터 본문 CSS(`apps/web/src/features/editor/editor-content.css`): 렌더링된 문서 요소(표, 구분선, code block 등)의 선을 허용한다.
- 그 밖의 모든 곳에서는 border 를 쓰지 않는다.

### 3. 예외 방식 — [user] lint 설정으로만

- 예외는 lint 설정 파일의 경로 override 로만 만든다. 그래서 예외는 설정 diff 로만 생기고 리뷰에서 드러난다.
- 코드 안의 disable 주석으로 규칙을 끌 수 없다.
  - Stylelint 는 `ignoreDisables` 로 disable 주석을 무시한다.
  - ESLint 는 `no-restricted-disable` 로 UI 규칙의 disable 주석을 오류로 만든다.

### 4. 스타일 헌법 — [user] 보류

- 기계 판독 규칙 파일(`style.rules.json` 등)과 거기서 lint 설정을 생성하는 방식은 지금 만들지 않는다.
- 대신 두 가지를 둔다.
  - lint 설정의 규칙마다 `UI-###` id 를 단다.
  - `DESIGN.md` §2 에 규칙표를 둔다.
- `pnpm docs:check` 가 규칙표의 id 와 lint 설정의 id 가 일치하는지 검사한다.
- 권위는 ADR 에 있다. 규칙표와 lint 설정은 ADR 을 구현한다.

### 5. 규칙과 도구 — [agent] 세부 G1 (`decided_by: agent:claude-code`, `ratify_by: 2026-10-03`)

| id | 규칙 | 강제 방법 |
| --- | --- | --- |
| UI-001 | border 폭과 스타일은 0/none 만 허용한다. 레이아웃 CSS 에서는 한쪽 변 `1px solid var(--token)` 을 허용하고, 에디터 본문 CSS 에서는 제한하지 않는다. | Stylelint `declaration-property-value-disallowed-list`, `property-disallowed-list` |
| UI-002 | 가짜 border 를 막는다. `box-shadow`, `outline`, `background-image` 는 `none` 이나 token(`var(--…)`)만 쓰고, gradient 함수는 token 파일에서만 쓴다. | Stylelint `declaration-property-value-allowed-list`, `function-disallowed-list` |
| UI-003 | 색 literal(hex, 이름 색, 색 함수)은 token 파일(`apps/web/src/styles/tokens.css`)에서만 쓴다. | Stylelint `color-no-hex`, `color-named`, `function-disallowed-list` |
| UI-004 | `@apply` 를 쓰지 않는다. | Stylelint `at-rule-disallowed-list` |
| UI-005 | inline `style` 은 `--name` custom property 만 넘긴다. | ESLint `no-restricted-syntax`(AST selector) |
| UI-006 | Tailwind 가 TSX 에서 utility 를 만들지 않는다. | `@import "tailwindcss" source(none)` |
| UI-007 | 새 SCSS 파일을 만들지 않는다. 기존 Tiptap 과 전역 partial 경로만 허용한다. | `pnpm arch:check` |

- **기존 위반은 bulk suppression 으로 기록하는 ratchet 이다.**
  - Stylelint 는 `stylelint-suppressions.json`, ESLint 는 `eslint-suppressions.json` 에 기록한다.
  - 새 위반은 실패한다. 이미 줄어든 위반을 기록에 그대로 두어도 실패한다.
    - ESLint 는 이 동작이 기본이다.
    - Stylelint 는 `scripts/lint-css.mjs` 가 기록과 현재 위반을 비교한다.
  - 정리한 뒤에는 `pnpm lint:css --prune` 이나 `eslint --prune-suppressions` 로 기록을 줄인다.
- UI-006 을 켜도 화면은 바뀌지 않는다.
  - 빌드 CSS 를 비교하면, 빠지는 것은 TSX 의 우연한 단어("hidden", "border" 등)에서 생긴 utility 뿐이다.
  - 그 utility 를 class 로 쓰는 곳은 없다.

### 6. 한계

- border 없이 배경색과 padding 만으로 만든 card 모양은 lint 로 잡을 수 없다. ADR-0014 의 스크린샷 리뷰가 계속 이 부분을 맡는다.

## 결과

- 새 스타일 코드는 처음부터 UI-001~007 을 지켜야 한다. 기존 위반은 화면 단위 PR 에서 줄여 나간다.
- 후속 정리
  - token 정의를 `global.css` 에서 `apps/web/src/styles/tokens.css` 로 옮긴다.
  - 패널 경계를 레이아웃 CSS 로 옮긴다.
  - `@apply` 를 plain CSS 로 옮긴다.
  - Tiptap SCSS 는 CodeMirror 전환 때 제거한다.
- CodeMirror 6 theme(`EditorView.theme`)은 `var(--token)` 만 참조한다. 이 규칙의 lint 는 CodeMirror 를 도입할 때 추가한다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-26 | 최초 결정 | user (§1–4), agent:claude-code (§5 세부) |
