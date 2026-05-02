---
title: Autonomous Requirements Resolution Goal
status: active
purpose: operating goal for autonomous requirements execution
---

# Autonomous Requirements Resolution Goal

This document is an operating goal for autonomous execution. It does not replace
`docs/requirements/**`, `subject.md`, product documents, ADRs, or task files as the source of
truth. Use it to coordinate how agents read requirements, choose work, execute, verify, document,
and commit.

## Goal

Autonomously resolve the requirements in `docs/requirements`.

The main orchestrator must read the requirements, decide priority, create execution plans and
tasks, delegate safely, implement, review, verify, update requirement/task documents, and commit at
verified task boundaries.

Do not wait for the user to assign each task. Continue the loop until all currently actionable
requirements are complete, blocked with concrete reasons, or require explicit product, security, or
destructive-action approval.

## Source Of Truth

Follow these documents in priority order:

1. `AGENTS.md`
2. `subject.md`
3. `docs/compliance/subject-matrix.md`
4. `docs/requirements/registry.md`
5. `docs/product/product-quality-gates.md`
6. `tasks/exec-plan/AUTO-PHASE-LOOP.md`
7. `tasks/README.md`
8. `tasks/_templates/SUBAGENT-PREAMBLE.md`

Never cite `.note/**` as official evidence.

## Relationship To Auto Phase Loop

`tasks/exec-plan/AUTO-PHASE-LOOP.md` is a safety and structure guide, not a reason to stop
autonomous progress early.

Interpret its defer/stop language narrowly:

- Stop only for hard blockers that require user approval, destructive action, security policy,
  data-retention policy, conflicting official requirements, write-set collision, or unverifiable
  completion claims.
- If one candidate is blocked, record the blocker in the active ExecPlan or task file, then select
  the next actionable requirement.
- If a requirement is too large, split it into smaller tasks instead of stopping.
- If a requirement is ambiguous, first perform safe ambiguity-reduction work such as inventory,
  characterization tests, gap documentation, or task planning.
- If a backlog item cannot be implemented yet, complete its `next_step` if that can be done safely.
- Defer means "record why this exact candidate cannot proceed now and continue with another
  candidate", not "end the autonomous run".

## Initial Mission

Start with reconciliation.

`TASK-085` through `TASK-091` are historical skipped or partial attempts. Their archived status is
not proof of completion.

Before implementation:

1. Inspect current requirements, archived task files, code, tests, and docs.
2. Classify `TASK-085` through `TASK-091` as:
   - `complete-with-evidence`
   - `partial`
   - `skipped`
   - `stale-or-invalid`
3. Create a new reconciliation ExecPlan:
   - `tasks/exec-plan/auto-YYYYMMDD-HHMM-requirements-reconciliation.md`
4. Create and execute a first audit task:
   - `TASK-092-requirements-task-state-reconciliation`
5. Record which requirements are truly done, which need reopening, which docs are stale, and which
   verification commands prove the classification.

## Autonomous Priority

After reconciliation, choose one small phase at a time.

Priority order:

0. Reduce actionable ambiguity first. If an ambiguous or stale requirement can be audited, scoped,
   tested, or split without product-policy risk, do that before unrelated implementation.
1. Fix requirements/task state drift caused by skipped `TASK-085` through `TASK-091`.
2. Protect CE-01 through CE-05 product paths and acceptance tests.
3. Close high-priority taskable product-foundation requirements:
   - `REQ-PRODUCTION-ACCOUNT-MANAGEMENT`
   - `REQ-WORKSPACE-LIFECYCLE-MANAGEMENT`
   - `REQ-WORKSPACE-MEMBER-MANAGEMENT`
   - `REQ-DOCUMENT-TRASH-RESTORE`
4. Then handle taskable product-extension, UX, and ops requirements:
   - `REQ-EDITOR-FIRST-UI-REFRESH`
   - `REQ-COLLABORATIVE-CREATION-VISIBILITY`
   - `REQ-DEV-LOCAL-PRODUCT-SEED-DATA`
   - `REQ-PRESENCE-CARET-LABEL-LEGIBILITY`
   - `REQ-CE-ACCEPTANCE-TEST-DECOUPLING`
5. Do not implement backlog or blocked requirements beyond their `next_step` unless they are
   formally promoted.

## Ambiguity Handling

Do not stop merely because a requirement is ambiguous.

If ambiguity can be reduced through repository inspection, tests, code reading, or official docs,
do that work first.

Safe preparatory work includes:

- implementation inventory,
- ExecPlan creation,
- task splitting,
- characterization tests,
- gap documentation,
- verification planning,
- narrow implementation already implied by official requirements.

Record assumptions before implementing under uncertainty.

Stop and ask only when ambiguity requires product policy approval, destructive behavior,
security/auth policy changes, data retention decisions, new dependency adoption, or user-facing
scope expansion.

## Model Routing

The main orchestrator runs on Codex 5.4 or 5.5.

Subagents inherit the main model by default. Override only when clearly useful.

Use strongest reasoning for:

- requirements reconciliation,
- architecture/domain/auth/storage decisions,
- ADR-worthy tradeoffs,
- final critic/reviewer passes,
- ambiguous product-quality-gate judgments.

Use default inherited model for implementation workers.

Use lighter/faster agents only for narrow read-only scout tasks.

Do not spawn agents just because capacity exists. Use agents only when work is independent and
write sets do not overlap.

## Agent Workflow

For each phase:

1. Scout agents inspect narrow areas only.
2. Planner/critic validates scope, write sets, dependencies, and CE risk.
3. Workers implement only declared task write sets.
4. Reviewers check:
   - requirement alignment,
   - write set violations,
   - product quality gates,
   - architecture/domain drift,
   - verification evidence.
5. Main session integrates results, archives task files, updates requirements, and commits.

Every delegated prompt must include the subagent preamble and assigned task text directly.

## Working Notes

Keep important notes in official artifacts, not only chat context.

Use active ExecPlans and task files to record:

- assumptions,
- decisions,
- evidence checked,
- verification results,
- skipped/stale task findings,
- blockers,
- next recommended action.

At phase end, record:

- completed tasks,
- commits,
- requirements updated,
- agents used and closed,
- remaining risks,
- next phase recommendation.

## Execution Rules

Create new ExecPlans only when a phase needs coordination or multiple tasks.

Use task files and move them through:

- `tasks/todo/`
- `tasks/active/`
- `tasks/archive/`

Requirements are closed only when:

- code/docs match acceptance,
- verification is recorded,
- product quality gates are not weakened,
- related task is archived with evidence.

## ADR And Refactor Policy

Write or update ADRs when changing:

- storage strategy,
- sync architecture,
- auth/session boundary,
- authorization model,
- domain model,
- platform/runtime boundary,
- public contract policy.

Refactor only when needed for the active requirement. Unrelated cleanup becomes a separate task.

## Verification

Use `scripts/with-node.sh <command>` for Node/pnpm commands.

Defaults:

- Web changes: `scripts/with-node.sh pnpm --filter @rme/web typecheck`
- API changes: `scripts/with-node.sh pnpm --filter @rme/api typecheck`
- Contract/domain changes: targeted tests plus `scripts/with-node.sh pnpm arch:check`
- CE changes: relevant `scripts/with-node.sh pnpm test:e2e -- e2e/ce-*.spec.ts`
- Multi-boundary phase: run the narrowest sufficient verification, then escalate to `pnpm check`
  when justified.

## Commit Policy

Commit after each verified task boundary.

Rules:

- Use Git Hutler for stack/commit organization if available.
- Still verify state with normal git status/diff/log.
- Stage explicit files only.
- Never use `git add .`.
- Never commit unrelated user changes.
- Use conventional commit messages with task or requirement IDs.

Examples:

- `docs(tasks): reconcile skipped productization tasks`
- `feat(auth): add product login flow for REQ-PRODUCTION-ACCOUNT-MANAGEMENT`
- `test(ce): decouple acceptance specs from UI layout`

## Stop Conditions

Stop and record a blocker when:

- official requirements conflict,
- product/security/destructive approval is needed,
- data-loss risk appears,
- write sets overlap,
- user changes would be overwritten,
- deferred scope would be implemented accidentally,
- verification cannot support completion.
