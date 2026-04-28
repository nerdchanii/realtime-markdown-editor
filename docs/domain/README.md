---
title: docs/domain/README.md
status: active
---

# docs/domain/README.md

## 목적

Domain docs는 구현이 지켜야 할 제품 언어와 계약을 정의한다. Persistence schema가 아니며 code를 대체하지 않는다.

## 읽는 순서

1. `docs/domain/glossary.md`
2. `docs/domain/models/workspace.md`
3. `docs/domain/models/user.md`
4. `docs/domain/models/document.md`
5. `docs/domain/models/document-state.md`
6. `docs/domain/relations/user-workspace.md`
7. `docs/domain/relations/workspace-document.md`
8. `docs/domain/rules/document-lifecycle.md`
9. `docs/domain/rules/collaboration-boundaries.md`

## 변경 규칙

Domain meaning 변경은 민감하다. Entity responsibility, relationship meaning, lifecycle state, provider boundary를 바꾸는 경우 관련 domain doc을 업데이트하고 ADR 필요 여부를 확인한다.

## 다이어그램 정책

Mermaid/UML은 domain contract 보존에 도움이 되는 relationship과 state transition에만 사용한다. 모든 code field를 문서에 중복 기재하지 않는다.
