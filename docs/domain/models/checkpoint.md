---
title: docs/domain/models/checkpoint.md
status: active
---

# docs/domain/models/checkpoint.md

## 계약

`Checkpoint`는 reviewer가 조회할 수 있는 user-visible historical document state의 metadata다. Ordinary autosave나 provider sync event가 아니다.

## 책임

- 어떤 `Document`의 history entry인지 나타낸다.
- 작성자 역할의 `WorkspaceMembership`을 참조할 수 있다.
- 생성 시각과 사용자에게 보이는 message를 가진다.
- Inspectable content snapshot을 찾기 위한 opaque artifact reference를 가진다.

## 경계

- Snapshot payload, CRDT update, rendered HTML, object storage key의 세부 형식은 domain entity가 아니다.
- Checkpoint restore는 first skeleton에서 필수 요구가 아니다. CE-04는 history 조회와 이전 content inspection을 우선한다.
- Autosave/sync state를 자동으로 user-authored checkpoint처럼 표시하지 않는다.
