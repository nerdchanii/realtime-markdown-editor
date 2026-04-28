---
title: docs/product/editor/presence.md
surface: editor
related_requirements:
  - CE-02-PRESENCE
  - REQ-PRESENCE-MEMBER-AWARENESS
  - REQ-IDENTITY-MEMBERSHIP
related_adrs:
  - ADR-0001
  - ADR-0005
---

# docs/product/editor/presence.md

## 의도

Presence는 remote cursor와 selection state를 stable member identity와 함께 보여주어 협업을 관찰 가능하게 만든다.

## 제품 범위

- Remote cursor position을 표시한다.
- Selected range를 표시한다.
- Workspace membership name과 color를 사용한다.
- Editing session 중 manual refresh 없이 갱신한다.

## 제외 범위

- 음성/영상 상태.
- 특정 사용자를 따라가는 viewport tracking.
- Editor 밖의 chat-like typing indicator.

## 검증

한 member가 cursor를 이동하거나 text를 선택하면, 다른 session에서 해당 위치 또는 range가 올바른 member label/color와 함께 표시된다.
