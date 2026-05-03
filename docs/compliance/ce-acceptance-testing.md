---
title: Feature Acceptance Testing Policy
status: active
---

# Feature Acceptance Testing Policy

Feature tests protect user-visible outcomes without freezing incidental layout or copy.

## Policy

- Feature e2e specs verify convergence, presence, reconnect merge, history inspection, and rich
  Markdown authoring/export preservation.
- Specs should call acceptance helpers from `e2e/support/ce-acceptance.ts` for product setup,
  editor actions, checkpoint actions, and export actions.
- Feature specs should not directly preserve layout, toolbar placement, button copy, seed document
  names, route structure, or adapter wiring as product contract.
- Product UI details that are worth preserving, such as toolbar controls or accessibility labels,
  belong in product smoke specs or API/use-case tests.
- Auth, membership, document scope, checkpoint permission, and export permission stay covered by
  API/use-case/contract tests where possible; CE e2e can rely on those policies instead of
  re-testing every authorization branch.

## Current Split

- `e2e/ce-*.spec.ts` contains legacy-named feature acceptance behavior.
- `e2e/product-editor-toolbar.spec.ts` keeps toolbar-specific product smoke coverage separate.
- `e2e/support/ce-acceptance.ts` is the selector boundary for feature tests. UI refresh work should
  update this helper when the product interaction changes, without rewriting feature assertions.
