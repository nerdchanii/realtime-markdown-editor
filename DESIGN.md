---
title: DESIGN.md
version: 0.5.0
based_on:
  - docs/adr/0014-ui-principles.md
  - docs/adr/0013-document-type-model.md
  - docs/adr/0015-plain-css-and-style-lint.md
previous_version: docs/archive/design/DESIGN-v0.3.2.md
---

# DESIGN.md

UI 작업을 하기 전에 이 문서를 읽는다. 결정의 근거와 출처는 ADR-0014(UI 원칙), ADR-0015(스타일 방식과 lint), ADR-0013(편집 화면)에 있다.
이 문서와 ADR 이 충돌하면 ADR 을 따른다.

## 1. 한 줄 원칙

**Linear 의 밀도와 키보드, Zed 의 에디터 중심, Figma 의 멀티플레이어 존재감.** 다크 우선이다.

## 2. 절대 규칙

위반하면 PR 을 받지 않는다. 스타일 규칙은 [ADR-0015](docs/adr/0015-plain-css-and-style-lint.md) 에 따라 lint 가 검사한다(`pnpm lint`, `pnpm lint:css`, `pnpm arch:check`).

1. **요소를 테두리 박스나 card 로 감싸지 않는다.**
   - 영역은 배경 톤과 여백으로 구분한다.
   - border 는 두 곳에서만 쓴다.
     - 레이아웃 CSS(`apps/*/src/layouts/**/*.css`)의 패널 경계선: 한쪽 변, 1px, token 색
     - 에디터 본문 CSS(`apps/*/src/features/editor/editor-content.css`)의 문서 요소: 표, 구분선, code block 등
   - 예외는 lint 설정 override 로만 만든다. 코드 안의 disable 주석은 무시되거나 오류가 된다.
2. **색은 theme token 으로만 쓴다.** 색 literal 은 token 파일(`apps/*/src/styles/tokens.css`)에서만 정의한다.
3. **스타일은 plain CSS 로 쓴다.** semantic class 에 CSS 를 쓰고, 새 SCSS, Tailwind utility, `@apply` 는 쓰지 않는다.
4. 요청하지 않은 기능, 섹션, 장식을 추가하지 않는다.
5. 동작하지 않는 기능을 동작하는 것처럼 보여주지 않는다. 기능이 없으면 명시적인 빈 상태를 보여준다.
6. mock, seed, 개발용 계정과 문구를 제품 화면에 노출하지 않는다.

### 스타일 규칙표

lint 설정의 규칙 id 와 이 표는 `pnpm docs:check` 가 대조한다.

| id | 규칙 | 강제 |
| --- | --- | --- |
| UI-001 | border 는 위의 두 곳에서만 쓴다. | Stylelint |
| UI-002 | `box-shadow`, `outline`, `background-image` 는 `none` 이나 `var(--token)` 만 쓴다. gradient 와 `url()` 은 token 파일에서만 쓴다. 가짜 border 를 막기 위한 규칙이다. | Stylelint |
| UI-003 | 색 literal(hex, 이름 색, 색 함수)은 token 파일에서만 쓴다. | Stylelint |
| UI-004 | `@apply` 를 쓰지 않는다. | Stylelint |
| UI-005 | inline `style` 과 코드의 DOM 스타일(`el.style.x =` 등)은 `--name` custom property 만 넘긴다. | ESLint |
| UI-006 | Tailwind 는 TSX 에서 utility 를 만들지 않는다(`source(none)`). Tailwind import 는 한 곳뿐이고, `@source`, `@plugin`, `@config` 를 쓰지 않는다. | `pnpm arch:check`, Stylelint |
| UI-007 | 새 SCSS 파일을 만들지 않는다. | `pnpm arch:check` |

- 기존 위반은 `stylelint-suppressions.json`, `eslint-suppressions.json` 에 기록되어 있다. 기록은 줄이는 방향으로만 바뀐다.
- 위반을 정리했으면 `pnpm lint:css --prune`, `pnpm exec eslint . --prune-suppressions` 로 기록을 줄이고 함께 커밋한다.
- 기록한 개수를 올릴 수는 없다. `pnpm suppressions:check` 가 base 브랜치와 비교한다.
- border 없이 배경만 다르게 만든 card 는 lint 로 잡지 못한다. 스크린샷 리뷰로 확인한다.

## 3. 레이아웃

```txt
+---------------------------------------------------------------+
| Top bar: Workspace > Project    명령 팔레트(⌘K)    테마 | 프로필 |
+--------------+--------------------------------+---------------+
| Explorer     | 탭                             | 오른쪽 패널   |
| (접을 수 있음) | 에디터 (접히지 않음)              | (접을 수 있음)  |
+--------------+--------------------------------+---------------+
```

- 기본은 3분할이다. **탐색기와 오른쪽 패널은 접을 수 있다.** 에디터는 항상 주인공이다.
- 패널 접기는 단축키, 명령 팔레트, 패널의 토글로 할 수 있다. 접힌 상태는 사용자별로 기억한다. [agent G1]
- 전역 하단 status bar 는 두지 않는다. 문서 상태는 문서 헤더 근처에 둔다.

## 4. 표면과 구분 방법

| 대상 | 구분 방법 |
| --- | --- |
| 패널 사이 | 배경 톤 차이. 필요하면 1px 경계선 한 개. |
| 목록 행(탐색기, 멤버, history) | 여백과 hover·active 배경. 행마다 테두리를 두르지 않는다. |
| 입력 필드 | 채워진 배경. focus 는 outline 이나 ring 으로 표시한다. [agent G1] |
| 버튼 | 배경이나 텍스트로 표시한다. 기본 버튼에 테두리를 두르지 않는다. |
| 떠 있는 표면(메뉴, popover, dialog) | 한 단계 다른 배경, 그림자, radius. 내부 요소를 다시 박스로 감싸지 않는다. [agent G1] |
| 설정 화면 | 섹션 제목과 여백으로 나눈다. 필드마다 박스를 만들지 않는다. |

## 5. 에디터 (ADR-0013)

- `markdown` 문서는 CodeMirror 6 기반 **라이브 프리뷰**로 편집한다.
  - 서식은 인라인으로 렌더링한다. 커서가 있는 줄에서만 Markdown 기호가 드러난다.
  - Tiptap WYSIWYG toolbar 는 목표 모델에 없다. 서식 명령은 단축키, 명령 팔레트, 필요할 때 나타나는 작은 도구로 제공한다. [agent G1]
- 본문은 가운데 정렬된 읽기 좋은 폭(약 760px)을 쓴다. 본문을 card 로 감싸지 않는다.
- 문서 제목은 본문의 첫 H1 이다. 제목 입력칸을 본문 밖에 따로 두지 않는다. [user]
- properties 와 상태는 본문 밖 문서 헤더에 둔다. frontmatter 를 본문 텍스트로 보여주지 않는다.

## 6. 멀티플레이어 (Figma)

- 다른 사람과 에이전트의 커서, 선택, 이름표를 편집면 안에 표시한다.
- **에이전트는 사람과 구분해서 표시한다**(ADR-0012 principal). 표시 방식은 에이전트 참여 결정(#4)에서 구체화한다.
- 같은 존재 정보를 여러 곳에 중복해서 표시하지 않는다.

## 7. 테마

- 다크가 기준이다. 라이트도 같은 수준으로 동작해야 한다.
- 모든 표면, 텍스트, 경계선, 강조색은 `apps/web/src/styles/global.css` 의 token 을 쓴다.
- 새 색이 필요하면 두 테마 모두에 token 을 추가한다.

## 8. 유지되는 기존 정보 구조 결정

이전 명세(v0.3.2)에서 가져온 결정이다. 바꾸려면 ADR 이 필요하다.

- Top bar: 왼쪽에 Workspace > Project, 가운데에 명령과 검색, 오른쪽에 테마 토글과 프로필이 있다. 별도 settings 톱니바퀴와 Share 버튼은 두지 않는다.
- Settings 는 프로필 메뉴에서 연다. Workspace, Project, User 범위로 나눈다.
- 오른쪽 패널은 History 를 중심으로 한다. Document Details, Comments, Outline 패널은 기본으로 노출하지 않는다.
- 탐색기 하단에는 Trash 와 Help 만 둔다.
- 프로젝트 관련 동작은 프로젝트 행의 `...` 메뉴 안에 둔다.

## 9. UI 작업 절차

1. 바꿀 화면 하나를 정한다. 한 PR 에서 한 화면을 다룬다.
2. 변경 전 스크린샷을 찍는다. 다크와 라이트 둘 다 찍고, 기준은 `docs/design/current-ui/` 다.
3. 변경한다. §2 절대 규칙을 지키고 lint 를 통과한다. 가능하면 그 화면의 suppression 기록을 줄인다.
4. PR 에 변경 전후 스크린샷을 붙인다. 사용자 승인을 받은 뒤 다음 화면으로 넘어간다.
5. 화면이 바뀌었으면 `docs/design/current-ui/` 의 해당 스크린샷을 갱신한다.
