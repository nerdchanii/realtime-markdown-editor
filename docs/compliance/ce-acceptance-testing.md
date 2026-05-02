---
title: CE Acceptance Testing Policy
status: active
---

# CE Acceptance Testing Policy

CE tests protect the five `subject.md` product stories. They should describe user-visible outcomes,
not the initial reviewer UI implementation.

## Policy

- CE e2e specs verify the behavior named by CE-01 through CE-05: convergence, presence,
  reconnect merge, history inspection, and rich Markdown authoring/export preservation.
- CE specs should call acceptance helpers from `e2e/support/ce-acceptance.ts` for product setup,
  editor actions, checkpoint actions, and export actions.
- CE specs should not directly preserve layout, toolbar placement, button copy, seed document names,
  route structure, or adapter wiring as CE contract.
- Product UI details that are worth preserving, such as toolbar controls or accessibility labels,
  belong in product smoke specs or API/use-case tests.
- Auth, membership, document scope, checkpoint permission, and export permission stay covered by
  API/use-case/contract tests where possible; CE e2e can rely on those policies instead of
  re-testing every authorization branch.

## Current Split

- `e2e/ce-*.spec.ts` contains CE acceptance behavior only.
- `e2e/product-editor-toolbar.spec.ts` keeps toolbar-specific product smoke coverage outside CE.
- `e2e/support/ce-acceptance.ts` is the selector boundary for CE tests. UI refresh work should
  update this helper when the product interaction changes, without rewriting CE story assertions.
