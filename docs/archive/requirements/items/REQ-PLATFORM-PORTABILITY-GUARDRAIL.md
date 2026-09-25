---
id: REQ-PLATFORM-PORTABILITY-GUARDRAIL
title: Browser, PWA, Tauri, Electron 가능성이 domain code로 새면 안 된다.
status: active
category: product-extension
type: architecture
taskability: blocked
scope: platform
derived_from: CE-03-OFFLINE-MERGE
depends_on: []
blocks: []
next_step: platform-specific API가 adapter concern으로 남는지 architecture check와 review에서 감시한다.
refs:
  - ARCHITECTURE.md
  - docs/domain/rules/collaboration-boundaries.md
---

# REQ-PLATFORM-PORTABILITY-GUARDRAIL

플랫폼 선택은 future concern이며, 현재 domain boundary는 web runtime에 종속되면 안 된다.
