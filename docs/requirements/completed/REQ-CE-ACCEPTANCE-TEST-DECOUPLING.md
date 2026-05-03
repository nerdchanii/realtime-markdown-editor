---
id: REQ-CE-ACCEPTANCE-TEST-DECOUPLING
title: CE acceptance test는 초기 UI 구현 세부사항이 아니라 사용자 행동 계약을 검증해야 한다.
status: done
category: subject-derived
type: quality
priority: high
taskability: done
scope: testing
derived_from:
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-04-REVISION-HISTORY
  - CE-05-RICH-PREVIEW
depends_on: []
blocks: []
next_step: done
refs:
  - subject.md
  - docs/compliance/feature-acceptance-map.md
  - docs/compliance/ce-acceptance-testing.md
  - docs/architecture/frontend.md
  - DESIGN.md
  - e2e/
---

# REQ-CE-ACCEPTANCE-TEST-DECOUPLING

Legacy feature tests는 제품의 핵심 행동을 검증해야 하며, 초기 UI, seed workspace,
버튼 문구, test id 배치, local fixture 구조를 제품 계약처럼 고정하면 안 된다.

이 요구사항은 테스트가 구현 독립적인 acceptance contract로 동작하게 만드는 것이다. UI refresh,
auth/session 경계, workspace 모델, editor runtime을 개편해도 feature tests가 초기 구현 보존 압박이
아니라 사용자 행동 보호 장치로 작동해야 한다.

Acceptance:

- Feature tests는 동시 편집 수렴, presence 표시와 정리, offline reconnect merge, history 조회, rich preview/export
  보존 같은 사용자 관점 결과를 검증한다.
- Feature tests는 특정 레이아웃, 버튼 문구, seed 문서명, toolbar 위치, route helper, 특정 adapter 생성 방식 같은
  초기 구현 세부사항을 고정하지 않는다.
- UI copy와 visual composition 개선은 feature tests를 깨뜨리지 않아야 한다.
- 접근성상 유지해야 하는 이름과 역할은 UI/a11y smoke test 또는 명시적 product contract에서 다룬다.
- Auth, membership, document scope, checkpoint 권한, export 권한 같은 정책은 가능한 한 API/use-case/contract 테스트에서
  검증하고, CE e2e가 보안 정책 전체를 떠맡지 않는다.
- 기존 `e2e/ce-*.spec.ts`는 새 정책에 맞게 개편하거나 legacy smoke로 분리한다.
- `docs/compliance/feature-acceptance-map.md`는 feature behavior 표현을 유지해야 한다.

Non-goals:

- 핵심 feature behavior 기준을 낮추지 않는다.
- `DESIGN.md` UI refresh를 막기 위해 기존 초기 UI를 보존하지 않는다.
- Product source code를 테스트 편의 목적으로 변경하지 않는다. 안정적인 hook이 필요하면 별도 UI/product task로 분리한다.

Evidence:

- `docs/compliance/ce-acceptance-testing.md` defines the feature acceptance policy and selector boundary.
- `e2e/support/ce-acceptance.ts` centralizes feature setup and product interactions.
- `e2e/ce-*.spec.ts` now calls acceptance helpers for editor, checkpoint, export, and sync actions
  instead of encoding those interaction details in every feature assertion.
- Toolbar-specific product smoke coverage moved to `e2e/product-editor-toolbar.spec.ts`, outside the
  CE-05 acceptance spec.
