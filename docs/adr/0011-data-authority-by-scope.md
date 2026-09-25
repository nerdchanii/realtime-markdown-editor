---
id: ADR-0011
title: "ADR-0011: 데이터 권위는 workspace 범위별로 명시한다"
status: accepted
date: 2026-09-25
gate: G2
decided_by: user
ratified_by: user
ratified_at: 2026-09-25
reversibility: one-way
revisit_if: local 범위가 실제 사용에서 요구되지 않거나, server 범위만으로 오프라인과 즉시성 요구가 충족되면 local 범위 도입을 다시 본다.
related_documents:
  - docs/direction/2026-09-24-product-direction-interview.md
  - docs/adr/0003-storage-strategy.md
  - docs/adr/0009-yjs-document-source-of-truth-and-artifact-policy.md
  - docs/adr/0012-authorization-policy-and-principals.md
supersedes: []
superseded_by: null
---

# ADR-0011: 데이터 권위는 workspace 범위별로 명시한다

> **accepted (2026-09-25)**
>
> - 비교안과 추천안은 에이전트가 작성했다.
> - 사용자가 C 안(범위별 권위)을 선택했고, local 범위를 바로 도입하기로 했다.
> - 세부 질문도 2026-09-25 에 모두 결정되었다.
> - 추적 Issue: #2

## 맥락

### 사용자 의도 (인터뷰 §3)

- [user] client-first 를 고민하는 동기는 네 가지 모두다.
  - 즉시성과 오프라인
  - 데이터 소유와 프라이버시
  - 서버 단순화와 비용
  - 데스크탑과 로컬 파일
- [user] 협업 규모는 소규모 팀과 조직 단위를 둘 다 본다.
- [user] 조직 통제와 개인 소유가 충돌하면 **범위별로 다르다**.
- [user] 어느 정도로 client-first 를 할지 판단할 근거가 부족하다. 비교 자료가 필요하다.

### 현재 구현 (코드 확인, HEAD 8bcd979)

- **본문이 Yjs 안에 두 가지 형태로 있다.**
  - Tiptap `Collaboration` 은 XmlFragment `"default"` 에 쓴다(`apps/web/src/features/editor/adapters/tiptap-yjs-runtime.ts:64`).
  - client 는 Tiptap 이 바뀔 때마다 Markdown 을 만들어 `Y.Text "markdown"` 에 따로 복제한다(`tiptap-yjs-runtime.ts:28`, `RichEditorPane.tsx`).
  - 서버는 snapshot 이 없는 문서를 `Y.Text` 에만 bootstrap 한다(`apps/collab/src/yjs-document-store.ts:48-66`).
  - 두 표현의 일관성은 client 코드에만 의존하고, 서버는 보장하지 않는다.
- **live 상태는 서버에 있다.**
  - Collab 서버가 전체 Yjs state 를 internal API 로 Postgres `Artifact.metadata.stateBase64` 에 upsert 한다.
  - 그 뒤 `Y.Text` 를 `documents.markdownBody` 로 projection 한다(`hocuspocus-runtime.ts:73-80`).
- **title 과 properties 는 Yjs 를 거치지 않는다.** REST 로 Postgres 에 직접 쓴다. 앱 어디에도 `getMap` 이 없다.
- **로컬 저장은 열린 문서뿐이다.** IndexedDB 에 문서 단위 Yjs state 를 저장한다. 닫힌 문서와 workspace 목록은 오프라인에서 쓸 수 없다.
- **Checkpoint 와 이미지는 로컬 파일시스템에 있다.** 경로는 `.data/checkpoint-artifacts` 이고, metadata 는 Postgres 에 있다. object storage adapter 는 없다.
- **기기 소유, 계정 없는 사용, desktop 패키징 개념이 없다.**
- **데이터 유실 위험이 있다.**
  - Yjs fallback 에서 store 가 실패하면 memory 에만 남는다.
  - REST content PUT 과 Yjs projection 이 서로 덮어쓴다.
  - IndexedDB draft 를 정리할 때 대기 중인 쓰기를 flush 하지 않는다.
  - archived 문서에도 projection 이 쓰인다.

### 핵심 관찰

Yjs 는 CRDT 라서 **본문 병합은 권위가 어디 있든 똑같이 동작한다**. 권위를 정한다는 것은 병합 알고리즘을 고르는
일이 아니다. 다음 네 가지를 누가 맡느냐를 정하는 일이다.

1. **권한 집행과 회수**: 누가 읽고 쓸 수 있는지 누가 판정하는가. 권한을 회수하면 무엇이 사라지는가.
2. **정본(canonical copy)**: 검색, projection, 서버 측 에이전트, 백업이 어느 사본을 기준으로 하는가.
3. **메타데이터**: 트리, title, properties, 멤버십을 어디서 조회하는가.
4. **계정과 네트워크 의존**: 서버나 계정 없이 쓸 수 있는가.

## 후보안

### A. 서버 권위 + 강한 로컬 캐시 (Linear, Figma 방식)

서버가 모든 데이터의 정본을 가진다. client 는 workspace 전체를 IndexedDB 에 캐시하고, 오프라인 편집은 CRDT 로 병합한다.

- **장점**
  - 권한 집행과 회수가 명확하다. 조직 통제, 감사, 서버 측 검색과 에이전트가 단순해진다.
  - 현재 구조의 연장선이다.
- **단점**
  - 데이터 소유와 프라이버시 동기를 충족하지 못한다.
  - 계정과 서버 없이는 쓸 수 없다.
  - 로컬 파일 연동이 부차적인 기능이 된다.
- **리스크**: 사용자가 말한 네 가지 동기 가운데 두 가지(소유, 로컬 파일)를 포기한다.

### B. Local-first (기기가 정본)

정본은 기기(IndexedDB, OPFS, 로컬 파일)에 있다. 서버는 sync peer, relay, 백업 역할을 한다. 계정은 선택 사항이다.

- **장점**
  - 즉시성, 오프라인, 소유, 로컬 파일을 가장 잘 충족한다. E2E 암호화도 가능하다.
  - 서버가 단순해진다.
- **단점**
  - 권한은 sync 시점에만 집행된다. 이미 동기화된 사본은 회수할 수 없다.
  - 서버 측 검색, projection, 서버 에이전트는 서버가 내용을 볼 수 있어야 가능한데, 이는 E2E 와 충돌한다.
  - 조직 감사와 통제가 약하다.
  - 여러 기기 간 메타데이터(트리, 멤버십) 충돌 처리가 복잡하다.
- **리스크**: 사용자가 원한 "조직 단위" 협업의 통제 요구와 부딪힌다.

### C. 범위별 권위 (추천)

`Workspace` 가 권위 범위를 가진다. `authority: server | local`.

- **server 범위** (조직, 팀)
  - 서버가 정본을 가지고, 권한을 집행하고, 감사를 맡는다.
  - client 는 A 안처럼 강한 로컬 캐시를 둔다.
  - 권한을 회수하면 이후 sync 가 차단된다. 이미 캐시된 사본은 best-effort 로 정리한다(ADR-0012 참조).
- **local 범위** (개인)
  - 기기가 정본을 가진다. 계정 없이도 쓸 수 있다.
  - 서버 sync 와 백업은 opt-in 이다.
  - 나중에 로컬 파일 연동도 이 범위에서 한다.
- **범위 전환**
  - local 문서를 다른 사람과 공유하면 server 범위 workspace 로 **승격(promote)** 한다.
  - 승격은 명시적인 사용자 행동이며, 정본이 서버로 옮겨간다는 사실을 사용자에게 보여준다.
- **공통 불변식**
  - 두 범위 모두 **문서 편집 상태의 정본 형식은 같은 Yjs document** 다.
  - 범위 전환은 형식 변환이 아니라 "정본 위치와 권한 집행자의 이동"이다.

C 안의 평가:

- **장점**
  - 사용자가 말한 "범위별로 다름"을 그대로 모델로 옮긴다.
  - 네 가지 동기를 범위별로 모두 충족한다.
  - server 범위를 먼저 완성하고 local 범위를 나중에 붙일 수 있다.
- **단점**
  - 두 가지 모드를 운영해야 한다.
  - 범위 전환(승격)의 UX 와 데이터 이동을 설계해야 한다.
- **리스크**
  - local 범위를 너무 일찍 구현하면 과거처럼 넓고 얕은 결과가 나올 수 있다.
  - 대응: 단계를 나눈다(아래 "결정 제안").

## 결정 (C 안, 사용자 선택)

1. **데이터 권위를 workspace 범위 속성으로 명시한다.** `authority: server | local`. 모든 쓰기 경로는 대상 workspace 의 authority 를 안다.
2. **문서 편집 상태의 write 정본은 Yjs document 다. 두 범위 모두 같다.**
   - 본문, title, properties, 필요하면 DocumentState 가 모두 Yjs 안의 구분된 field 에 있다.
   - 이 점은 ADR-0009 의 핵심 제안을 받아들인다.
   - Postgres 행(`documents.markdownBody`, `document_properties`)은 server 범위의 read projection 이다. 목록, 검색, 권한 join 에 쓴다.
   - direct REST write 는 projection 수정 경로로 쓰지 않는다. server 측 Yjs mutation 을 거친다.
3. **한 문서의 본문 정본은 Yjs 안에서 하나의 표현만 가진다.**
   - 지금처럼 XmlFragment 와 `Y.Text` 를 이중으로 쓰는 구조를 끝낸다.
   - Markdown 은 projection 과 export 표현이다.
   - 어떤 표현을 정본으로 할지는 문서 타입 모델 ADR(#5)에서 정한다.
   - 이 ADR 은 "하나여야 한다"는 불변식만 정한다.
4. **도입 순서.** [user] local 범위는 뒤로 미루지 않고 **바로** 도입한다.
   - **트랙 A (server 범위 정비)**
     - 알려진 데이터 유실 위험을 없앤다.
     - 본문 표현을 하나로 만들고, title 과 properties 를 Yjs 로 옮긴다.
     - 열린 문서만이 아니라 최근 문서와 workspace 트리까지 로컬에 캐시한다.
   - **트랙 B (local 범위)**
     - 개인 workspace 를 만든다. 이 workspace 는 기기가 정본이다.
     - 서버 sync 는 opt-in 이다. local 에서 server 로 가는 승격 흐름을 만든다.
   - 두 트랙은 병행한다. 둘 다 "정본 표현은 하나"(3번)에 의존한다.
     그래서 문서 타입 ADR(#5)에서 정본 표현을 먼저 정하는 것이 두 트랙 모두의 선행 조건이다.
   - **이후**: local 범위에 로컬 파일시스템을 연동하고 desktop 패키징을 한다(#6 과 연동).
5. **ADR-0003 과의 관계**
   - Postgres 는 metadata, object storage 는 snapshot 과 blob 을 맡는다는 역할 분담은 유지한다.
   - "IndexedDB 는 열린 page offline 전용"이라는 제한은 이 ADR 이 accepted 되면 server 범위 캐시와 local 범위 정본으로 확장된다.
   - ADR-0009 는 이 ADR 이 accepted 될 때 문서 SOT 부분이 흡수된다. checkpoint artifact 정책 부분은 별도로 남는다.

## 결정된 질문과 남은 질문

- [user] 데이터 권위: C 안(범위별)을 택한다.
- [user] local 범위 도입 시점: 바로 도입한다(server 정비와 병행).
- [user] local 범위의 opt-in sync 에서 **서버는 내용을 읽을 수 있다**. 그래서 백업, 검색, 서버 에이전트를 쓸 수 있다. E2E 암호화는 나중에 검토한다.
- [user] server 범위에서 권한을 회수하면 **이후 sync 를 차단하고, 앱이 다시 연결될 때 로컬 사본 삭제를 시도한다**. 완전한 삭제는 보장하지 않는다.
- [user] **계정 없이 local 범위를 쓸 수 있다.** 로그인은 sync 나 공유를 할 때만 요구한다.
  - 이때 작성자는 `LocalUser` principal 이다. 로그인이나 승격 때 계정에 연결한다(ADR-0012 §3).

## 결과

- 코드 수정 후보. accepted 뒤 별도 Issue 와 PR 로 진행한다.
  - 본문의 이중 표현(XmlFragment 와 `Y.Text`)을 하나로 만든다. 서버 bootstrap 도 정본 표현에 맞춘다.
  - title 과 properties 를 Yjs field 로 옮긴다. REST write 를 server 측 Yjs mutation 으로 바꾼다.
  - Yjs fallback 에서 store 실패를 명시적 오류로 바꾼다. memory-only 로 조용히 성공하지 않게 한다.
  - REST content PUT 과 projection 이 서로 덮어쓰는 문제를 없앤다.
  - IndexedDB draft 를 정리할 때 대기 중인 쓰기를 flush 한다.
  - archived 문서의 쓰기를 차단한다. 권한 정책과 함께 ADR-0012 에서 다룬다.
- `docs/domain/` 에 `Workspace.authority` 와 문서 편집 상태의 정본 규칙을 반영한다.

## 변경 이력

| 날짜 | 변경 | 결정자 |
| --- | --- | --- |
| 2026-09-25 | 최초 제안 (proposed) | agent:claude-code |
| 2026-09-25 | C 안 선택, local 범위 즉시 도입으로 accepted. 세부 질문 3개는 open | user |
| 2026-09-25 | 세부 결정: 서버 읽기 가능 sync(E2E 는 나중), 회수 시 sync 차단 + 사본 삭제 시도, 계정 없는 local 사용 허용 | user |
