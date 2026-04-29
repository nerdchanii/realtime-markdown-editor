---
title: TASK-00-repo-bootstrap
status: todo
scope: repo
---

# TASK-00: Repo Bootstrap

## 목표

TypeScript 기반 pnpm monorepo를 실행 가능한 형태로 만들고, 공통 formatter/lint/typecheck/commit/architecture guardrail을 root에서 운영한다.

## 범위

- Node 24와 pnpm workspace 고정.
- root TypeScript, ESLint, Prettier, dependency-cruiser, commitlint, husky 설정.
- `apps/api`, `apps/web`, `packages/contracts` skeleton.
- Superpowers worktree와 local/generated output ignore.

## 제외

- ADR-0002와 collaboration engine POC 결론.
- CE-01부터 CE-05까지의 실제 기능 구현.
- provider-specific package 생성.

## 검증

- `pnpm install`
- `pnpm check`
- `git check-ignore .worktrees worktrees .worktree .codex node_modules dist .env`
