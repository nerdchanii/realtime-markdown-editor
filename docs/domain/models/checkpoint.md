---
title: docs/domain/models/checkpoint.md
status: active
---

# docs/domain/models/checkpoint.md

## 계약

`Checkpoint`는 reviewer가 조회할 수 있는 user-visible historical document state의 metadata다. Ordinary autosave나 provider sync event가 아니다.

First skeleton에서 `Checkpoint`는 `Documents` capability가 소유하는 document history metadata다. Standalone `HistoryModule`은 restore, branching, independent retention/compliance, 또는 별도 SLA가 필요할 때 승격한다.

## 책임

- 어떤 `Document`의 history entry인지 나타낸다.
- 작성자 역할의 `WorkspaceMembership`을 참조할 수 있다.
- 생성 시각과 사용자에게 보이는 message를 가진다.
- Inspectable content snapshot을 찾기 위한 opaque artifact reference를 가진다.
- First skeleton의 inspectable snapshot은 ADR-0003 V1에 따라 Markdown snapshot artifact로 제공된다.
- Snapshot inspect는 checkpoint metadata를 기준으로 artifact boundary에서 Markdown body를 읽어 read-only response로 반환한다.

## 경계

- Snapshot payload, CRDT update, rendered HTML, object storage key의 provider 세부 형식은 domain entity가 아니다.
- Markdown snapshot artifact는 CE-04 read-only inspection을 위한 product revision artifact이며, live Yjs binary persistence와 구분한다.
- Live Yjs binary persistence는 collaborative provider state 재수화 책임이고, `Checkpoint`가 참조하는 Markdown snapshot artifact는 reviewer-facing history 책임이다.
- Checkpoint restore는 first skeleton에서 필수 요구가 아니다. CE-04는 history 조회와 이전 content inspection을 우선한다.
- Autosave/sync state를 자동으로 user-authored checkpoint처럼 표시하지 않는다.
