---
title: 2026-09-24 제품 방향 인터뷰 기록
status: record
date: 2026-09-24
interviewee: nerdchanii (product owner)
interviewer: agent (Claude Code session)
supersedes_context:
  - subject.md (저장소에 존재하지 않음, 과제 맥락 종료)
  - CE-01 ~ CE-05 를 제품 정의의 출발점으로 삼던 framing
---

# 2026-09-24 제품 방향 인터뷰 기록

이 문서는 제품 방향 전환을 위한 사용자 인터뷰의 **원본 기록**이다. 이후 ADR, vision, AGENTS.md 는
이 기록을 근거로 작성한다. 이 문서 자체를 수정해 의도를 바꾸지 않는다. 바뀐 결정은 새 기록이나
ADR 로 남기고 여기서는 링크만 추가한다.

## 읽는 법: 출처 표기

모든 항목은 누가 결정했는지 표시한다. 과거에 에이전트의 추론이나 `proposed` 문서가 사용자의
결정처럼 인용되어 의도가 어긋난 일이 반복되었기 때문이다.

- **[user]**: 사용자가 인터뷰에서 직접 선택하거나 말한 것. 사용자 결정으로 인용해도 된다.
- **[agent]**: 에이전트가 기록, 로그, 코드에서 추론하거나 제안한 것. 사용자 결정으로 인용하면 안 된다.
- **[open]**: 아직 결정되지 않은 것. 어떤 문서도 이것을 확정 사실로 쓰면 안 된다.

## 1. 제품 정의

- [user] 제품은 **동시편집 에디터**에서 출발한다. 하위 기능이나 구현이 바뀌어도 본질은 유지된다.
  **"동시편집"과 "에디터" 두 축이 모두 중요하다.**
- [user] 이름과 범위는 "Realtime **markdown** editor"에서 "**Realtime editor**"로 진화한다.
- [user] 과제(subject.md) 맥락은 사라졌다. subject 와 CE framing 은 더 이상 제품 정의의 기준이 아니다.
- [user] 목적은 **실사용 제품**이다. 포트폴리오나 실험장이 아니다.
- [user] 제품은 **ADE(Agentic Dev Environment)의 표면**이 되어야 한다. 사람과 AI 에이전트가 같은
  대상을 동시에 편집하는 작업 표면이다.
- [agent] 해석: "동시편집 참여자"는 사람뿐 아니라 에이전트를 포함한다. presence, 권한, history,
  authorship 은 참여자가 사람인지 에이전트인지 구분해서 다뤄야 한다.

## 2. 에디터 축: 편집 대상

- [user] Markdown 은 **여러 문서 타입 중 하나**가 된다. 제품 전체의 기본 포맷이 아니다.
- [user] 텍스트 문서 편집의 깊이(1), 블록과 속성 기반 구조화(2), 다양한 편집 대상(3)을 **모두
  포기하지 않고** 3 까지 가고 싶다.
- [user] 두 번째 이후 편집 대상으로 코드, 다이어그램과 캔버스, 표와 데이터베이스가 **모두 중요하다.**
- [agent] 제안(사용자가 반박하지 않음, 확정 아님): 공통 core(문서 컨테이너, 권한, 동기화, presence,
  history)와 문서 타입별 editor 를 분리한다. 첫 문서 타입 하나를 깊게 완성한 뒤 다음 타입으로 간다.
  넓고 얕은 skeleton 을 만들지 않기 위해서다.
- [open] 첫 번째로 깊게 완성할 문서 타입: rich text 로 할지 markdown 으로 할지.
  → [user] ADR 로 비교한 뒤 결정한다.

## 3. 데이터 권위: client-first 와 local-first

- [user] client-first 를 고민하는 동기는 네 가지 모두다.
  - 즉시성과 오프라인
  - 데이터 소유와 프라이버시
  - 서버 단순화와 비용
  - 데스크탑과 로컬 파일
- [user] client-first 를 어느 정도로 할지는 **아직 판단할 근거가 부족하다.** 비교 자료(ADR 후보)가 필요하다.
- [user] 조직 통제와 개인 데이터 소유가 충돌하면 **범위별로 다르다.** 권위가 누구에게 있는지를
  범위마다 명시한다.
- [agent] 해석: 조직 workspace 는 회수와 감사를 위해 서버 통제에 가깝고, 개인 범위는 로컬 소유에
  가깝다. 정확한 경계는 [open].
- [user] 파일시스템 연동은 나중에 할 생각이 있다.

## 4. 협업 규모와 권한

- [user] 당장 다룰 협업 규모는 **소규모 팀(2~20명)**과 **조직 단위** 둘 다다.
- [user] 보안 문제는 **권한 모델이 지켜지지 않는 데서 출발한다.** 먼저 권한 모델을 명확히 한다.
  그다음 그 policy 에 따라 코드를 명확하게 바꾼다.
- [user] 아직 배포한 적이 없어서 현재 보안 결함(collab 인증 부재 등)은 당장 급하지 않다. 다만
  권한 모델을 확정한 뒤 policy 기반으로 고친다.
- [user] AI 에이전트의 신원은 **둘 다**다. 사용자의 대리인(delegated)일 수도 있고, 독립된
  참여자(member)일 수도 있다.
- [user] 에이전트는 로컬과 서버 **어디서든 실행될 수 있다. 중요한 것은 프로토콜이다.**
- [open] 제품 안의 에이전트가 사용자 문서를 고칠 때 기본 동작: 제안(suggestion)으로 할지, 직접
  편집하고 추적할지, 권한과 설정에 따를지. 인터뷰 중 질문의 대상이 모호했다. 에이전트 참여 ADR 에서 다룬다.

## 5. 유지하는 도메인 개념

- [user] 새 방향에서도 핵심으로 유지하는 것:
  - Properties/DocumentState
  - Links/Backlinks
  - History/Checkpoint
  - Workspace, Project
- [user] Folder 처럼 **파일시스템을 흉내 내는 구조를 UI 가 구현해야 하는지는 고민 중**이다.
  실제 파일시스템과의 연동은 나중에 할 생각이다.
- [open] ADR-0006(filesystem-like workspace hierarchy)을 재검토한다.

## 6. 과거 AI 협업에서 의도가 어긋난 지점

- [user] 가장 자주, 또는 가장 아프게 어긋난 패턴:
  - mock 과 placeholder 가 제품 경로에 남거나, 요청하지 않은 표면이 새로 생김
  - 결정을 앞질러 간 문서
  - **UI 가 특히 크게 어긋남.** 요구를 하나도 지키지 않는 느낌이었다.
- [user] UI 가 어긋났을 때의 모습:
  - 명시한 스펙을 무시함
  - 동작하지 않는데 동작하는 척함
  - 편집 경험 자체가 나쁨
  - 원하지 않은 것을 추가함
  - **card 형태를 쓰지 말라고 했는데 계속 요소를 border 로 감쌈**
- [agent] 증거:
  - `DESIGN.md` 는 card 와 border 금지를 여러 곳에 명시한다(47, 121–146행). 그런데도 반복해서 위반되었다.
    **텍스트 규칙만으로는 지켜지지 않는다**는 뜻이다.
  - `docs/product/ui-capability-gap-log.md` 의 UI-GAP-006, 007(Favorites, DM mock), 013–017
    (mock collaboration, seed fallback)이 그 사례다.
  - ADR-0009 는 `proposed` 상태인데 `docs/domain/models/document.md` 가 확정된 것처럼 인용한다.
- [user] UI 레퍼런스는 **Linear, Figma, Zed 의 중간 어딘가**다.
  (원문: "Liner + firma + zed". 에이전트가 Linear, Figma 로 해석했다.)
  - [user] 2026-09-25 추가 확인: Linear, Figma, Zed 가 맞다. 추적: [#7](https://github.com/nerdchanii/realtime-markdown-editor/issues/7)
- [user] UI 를 어떤 식으로 개선해 나가야 할지 **본인도 어렵다고 느낀다.** 레퍼런스 이미지나 목업을
  기준으로 삼는 방식을 선호한다.

## 7. 개발 방식: 에이전트와 사람의 결정 권한

- [user] 계층별 결정 권한은 좋다. 하지만 사람이 모든 결정을 승인하면 **결정 피로와 병목**이 생긴다.
  에이전트가 사람보다 **더 넓고 전체적인 시야**를 유지할 때도 많다.
- [user] 출처 표기와 비동기 추인 모델이 좋다. 업계 흐름을 조사해 달라고 요청했다. 조사 요약은 부록 A 에 있다.
- [open] 조사를 바탕으로 한 G0/G1/G2 등급과 추인 기한(예: 7일)의 채택 여부.
- [user] 작업 기록은 **GitHub Issue/PR** 에 둔다. 지속되는 결정만 **저장소의 decision log 와 ADR** 로
  승격한다.
- [user] 걱정: Issue 로 옮기면 작업의 의도와 맥락, 결정이 남는가?
  - [agent] 답: 작업 기록(일회성)과 지속되는 결정을 분리한다. 에이전트가 PR 을 마무리할 때 지속되는
    결정을 decision log 로 승격하는 것을 완료 조건으로 둔다.
- [user] 문서 체계는 슬림 재구성이나 전면 재작성 중 하나로 재구조화한다. 저장소 문서는 **한국어로 쓰고
  도메인 용어와 식별자는 영어**로 쓴다.
- [user] 한 세션에서 모든 문제를 해결하지 않는다. 가장 효과적이고 시급한 것부터 **점진적으로** 해결한다.
- [user] 어긋남 없이 깨끗하고 정확한 에이전트 컨텍스트가 가장 급할 수 있다.
- [user] 기존 코드를 어떻게 할지는 **ADR 확정 뒤에** 결정한다.

## 부록 A. 에이전트 결정 권한 업계 흐름 조사 요약 (2026-09, [agent])

- 정착된 관행:
  - 사람이 계획을 먼저 승인한다.
  - 에이전트는 자기 PR 을 승인하거나 병합하지 않는다.
  - 에이전트용 context 파일(AGENTS.md, CLAUDE.md)은 짧은 "지도"로 유지하고, 반드시 지킬 규칙은 hook 과 CI 로 강제한다.
  - 완료 주장에는 검증 루프를 붙인다.
  - 출처: Claude Code best practices, GitHub Copilot coding agent docs, Anthropic "Measuring agent autonomy".
- 부상 중인 관행:
  - 확신도 기반 개입(Devin 2.1)
  - 자율성 단계 구분(Knight Columbia L1–L5, arXiv 2506.12469)
  - spec-driven development 의 `[NEEDS CLARIFICATION]` 표시(GitHub Spec Kit)
  - harness engineering: guides/sensors, computational/inferential 구분(OpenAI, Böckeler)
  - 에이전트가 작성하는 ADR 에 제안자와 승인일을 표기하는 방식
  - 결과가 맞더라도 근거한 권한과 완료 증거를 검증하자는 제안("Correct Is Not Governed", arXiv 2608.12761)
- 근거:
  - Bezos 의 Type 1/Type 2 결정 구분: 되돌릴 수 있는 결정에 무거운 절차를 쓰면 병목이 된다.
  - Apache 의 lazy consensus: 기한 안에 이의가 없으면 동의로 본다.
  - LLM 이 생성한 context 파일이 성공률을 떨어뜨린다는 연구(arXiv 2602.11988).
  - 오래된 지침은 없는 것보다 해롭다는 지적.
- 제안된 보강:
  1. 결정마다 `decided_by`, `gate`, `status`, `revisit_if`, `evidence` 를 기록한다.
  2. `proposed` 문서가 확정 사실로 인용되면 CI 가 실패한다.
  3. G1 은 기한 안에 이의가 없으면 accepted 로 본다.
  4. 제품 경로의 mock import 를 금지하는 lint 를 둔다.
  5. UI PR 에는 스크린샷 증거를 첨부한다.
  6. 작성자와 분리된 검증 에이전트를 둔다.
