---
id: ADR-0014
title: "ADR-0014: UI 는 Linear 의 밀도, Zed 의 에디터 중심, Figma 의 멀티플레이어를 따르고 규칙은 기계로 검증한다"
status: accepted
date: 2026-09-26
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-26
reversibility: two-way
revisit_if: 스크린샷 리뷰에서 같은 종류의 위반이 반복되면 lint 규칙을 늘리고, 원칙이 실제 사용에서 불편하면 다시 본다.
related_documents:
  - docs/direction/2026-09-24-product-direction-interview.md
  - docs/adr/0005-ui-shell-scope-model.md
  - docs/adr/0013-document-type-model.md
  - DESIGN.md
supersedes: []
superseded_by: null
---

# ADR-0014: UI 는 Linear 의 밀도, Zed 의 에디터 중심, Figma 의 멀티플레이어를 따르고 규칙은 기계로 검증한다

> **accepted (2026-09-26)**. 에이전트가 질문과 추천안을 만들었고, 사용자가 선택했다. 추적 Issue: #7

## 맥락

### 사용자 의도 (인터뷰 §6)

- [user] 과거 UI 는 요구와 크게 어긋났다. 구체적으로 이런 일이 있었다.
  - 명시한 스펙을 무시했다.
  - 동작하지 않는데 동작하는 척했다.
  - 편집 경험이 나빴다.
  - 원하지 않은 것을 추가했다.
  - **card 를 쓰지 말라고 했는데 요소를 계속 border 로 감쌌다.**
- [user] 레퍼런스는 **Linear, Figma, Zed 의 중간 어딘가**다(2026-09-25 확인).
- [user] UI 를 어떻게 개선해 나갈지는 어렵다.

### 현재 화면 (2026-09-26 캡처, `docs/design/current-ui/`)

- `DESIGN.md` 는 card 와 border wrapping 을 금지한다. 그런데 settings 대화상자는 모든 필드, 버튼, 멤버 행을 각각 테두리 박스로 감싼다(`05c-settings-workspace-dark.png`).
- dark 테마에서 편집 toolbar 가 흰색으로 남는다. 목록의 inline code 는 거의 보이지 않는다(`04-workspace-dark.png`).
- 로그인 화면에 "LOCAL SEED ACCOUNTS" 와 seed 계정 버튼이 제품 화면으로 나온다(`01-login-light.png`).
- 문서 frontmatter 가 본문 텍스트로 보인다.
- `DESIGN.md` 가 참조하는 레퍼런스 이미지(Reference 01A/01B/03)는 저장소에 없다.

텍스트 규칙만으로는 지켜지지 않았다. 그래서 이 ADR 은 원칙을 짧게 두고, 지킬 수 있는 것은 기계로 검증한다.

## 결정

### 1. 레퍼런스에서 가져오는 것 — [user] 세 가지 모두

| 레퍼런스 | 가져오는 것 |
| --- | --- |
| **Linear** | 높은 정보 밀도, 미세한 명도 차이로 구분하는 계층, 키보드 중심 조작(명령 팔레트, 단축키) |
| **Zed** | 에디터가 주인공이다. 패널과 탭은 에디터를 돕는 보조 요소다. |
| **Figma** | 멀티플레이어 존재감. 다른 사람과 에이전트의 커서, 선택, 이름이 편집면에서 자연스럽게 보인다. |

- [agent] 레퍼런스는 이미지 없이 위의 특징으로만 정의한다. [user] "텍스트로 충분"을 선택했다.
- 실제 판단은 스크린샷 리뷰로 한다(§5).

### 2. 영역 구분 — [user] 배경색과 여백

- 영역은 **배경 톤과 여백으로** 구분한다.
- 테두리는 **패널 사이 경계선 1px 까지만** 허용한다. `border-top`, `border-right`, `border-bottom`, `border-left` 가 이에 해당한다.
- **요소를 테두리 박스나 card 로 감싸지 않는다.** 필드, 버튼, 목록 행, 설정 항목, 편집 본문이 모두 해당된다.
- [agent] 세부 사항(G1, `ratify_by: 2026-10-03`):
  - 입력 필드는 테두리 대신 채워진 배경으로 구분한다. focus 는 outline 이나 ring 으로 표시한다.
  - 떠 있는 표면(메뉴, popover, dialog)은 한 단계 밝거나 어두운 배경과 그림자로 구분한다. 모서리 radius 는 허용하고, 내부 요소는 다시 박스로 감싸지 않는다.

### 3. 기본 화면 — [user] 3분할, 접을 수 있음

- 탐색기, 에디터, 오른쪽 패널(history 등)의 3분할을 기본으로 한다.
- **각 패널은 접을 수 있다.** 에디터는 접히지 않는다.
- [agent] 세부 사항(G1):
  - 패널 접기와 펴기는 단축키와 명령 팔레트로도 할 수 있다.
  - 패널이 접힌 상태는 사용자별로 기억한다.

### 4. 테마 — [user] 다크 우선, 라이트 지원

- 디자인과 리뷰의 기준은 다크 테마다. 라이트 테마도 같은 수준으로 동작해야 한다.
- 모든 색은 theme token(CSS custom property)으로만 쓴다. 하드코딩한 색은 테마를 깨뜨린다.
  - 지금 dark toolbar 가 흰색인 이유가 바로 이것이다.

### 5. 검증 — [user] 스크린샷 before/after 와 lint

- **UI 를 바꾸는 PR 에는 변경 전후 스크린샷을 붙인다.** 다크와 라이트 둘 다 필요하다. 화면 단위로 승인받고 다음으로 넘어간다.
  - 기준 스크린샷은 `docs/design/current-ui/` 에 있다. 화면이 바뀌면 이 기준도 갱신한다.
- **lint**: 정규식 기반 검사(`ui:check`)를 시도했지만 우회 경로가 계속 나와 제거했다([user] 2026-09-26, "정규식 lint 는 효과가 없다").
  - AST 기반 도구(Stylelint, ESLint 플러그인)로 강제하는 방법은 [#13](https://github.com/nerdchanii/realtime-markdown-editor/issues/13) 에서 정한다.
  - [user] border 는 필요할 때 쓸 수밖에 없다. border 를 넣는 레이어를 최소화하고, 그 레이어 안에서만 이유를 적은 예외 주석으로 허용하는 방식을 검토한다. 허용 레이어는 [open] 이다.

### 6. 이미 정해진 금지 사항 (AGENTS.md 와 같음)

- 요청하지 않은 기능, 섹션, 장식을 추가하지 않는다.
- 동작하지 않는 기능을 동작하는 것처럼 보여주지 않는다. 기능이 없으면 명시적인 빈 상태를 보여준다.
- mock, seed 데이터를 제품 화면에 노출하지 않는다.

## 결과

- `DESIGN.md` 를 이 ADR 에 맞춰 짧게 다시 쓴다.
  - 이전 상세 명세(v0.3.2)는 `docs/archive/design/DESIGN-v0.3.2.md` 로 옮긴다.
  - 편집 화면은 ADR-0013(CodeMirror 라이브 프리뷰)을 따른다.
- 현재 화면의 위반은 이 ADR 기준의 UI 결함으로 Issue 에 기록한다. 화면 단위 PR 로 고친다.
- 스타일 규칙의 기계 검증은 #13 의 결정을 따른다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-26 | 최초 결정 | user (방향), agent:claude-code (세부 G1) |
| 2026-09-26 | 정규식 lint 제거, AST 도구와 border 예외 레이어는 #13 으로 넘김 | user |
