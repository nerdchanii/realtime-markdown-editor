---
id: REQ-RESEARCH-REDIS-SUPPORT
title: Redis는 durable document storage가 아니라 support infrastructure로 분류한다.
status: planned
category: research
type: research
taskability: blocked
scope: platform
derived_from: REQ-OFFLINE-RECONNECT-MERGE
depends_on:
  - REQ-OFFLINE-RECONNECT-MERGE
blocks: []
next_step: Redis가 presence, pub/sub, cache, queue 중 어떤 역할을 맡는지 별도 research note로 분리한다.
refs:
  - ARCHITECTURE.md
  - docs/adr/0003-storage-and-history-policy.md
---

# REQ-RESEARCH-REDIS-SUPPORT

Redis 도입은 문서 durable storage가 아니라 support infrastructure 필요성이 생길 때만 검토한다.
