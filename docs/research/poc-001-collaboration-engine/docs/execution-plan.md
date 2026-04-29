---
title: POC-001 Collaboration Engine ExecPlan
status: completed-for-engine-selection
language: en
related_adrs:
  - ADR-0002
related_requirements:
  - REQ-RESEARCH-COLLAB-ENGINE-POC
  - CE-01-CONCURRENT-EDITING
  - CE-02-PRESENCE
  - CE-03-OFFLINE-MERGE
  - CE-05-RICH-PREVIEW
---

# POC-001 Collaboration Engine Comparison ExecPlan

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` updated while work proceeds.

## Purpose / Big Picture

This POC compares `Tiptap + Yjs + Hocuspocus` and `Yorkie + ProseMirror` under the same scenarios before finalizing the sync engine decision in ADR-0002. The decision is optimized for B2B team-document customers: realtime Markdown co-editing, presence, open-page offline reconnect merge, and Markdown source/rich/split authoring flows for the next implementation pass.

The engine-selection work is complete when both candidates can be run locally, comparable automated evidence is recorded, and ADR-0002 documents the selected stack. Full two-browser CE-01/CE-02 product acceptance remains part of the walking skeleton implementation path.

## Progress

- [x] 2026-04-29 KST: Read ADR-0002, the POC README, subject compliance matrix, requirement registry, and architecture boundary rules.
- [x] 2026-04-29 KST: Used subagents to confirm requirements, repository structure, and evaluation rubric.
- [x] 2026-04-29 KST: Assigned implementation subagents by role.
- [x] 2026-04-29 KST: Write the Korean ExecPlan and English ExecPlan.
- [x] 2026-04-29 KST: Create the POC-only pnpm workspace.
- [x] 2026-04-29 KST: Create shared adapter contract, seed Markdown, member identity, scenario, and rubric assets.
- [x] 2026-04-29 KST: Build the Tiptap/Yjs/Hocuspocus prototype.
- [x] 2026-04-29 KST: Build the Yorkie/ProseMirror prototype.
- [x] 2026-04-29 KST: Run typecheck/build/test and screenshot smoke for both candidates.
- [x] 2026-04-29 KST: Add Playwright browser-context offline reconnect E2E tests for both candidates.
- [x] 2026-04-29 KST: Verify Tiptap CE-03 E2E passes.
- [x] 2026-04-29 KST: Root-cause and fix the Yorkie CE-03 E2E failure caused by duplicate ProseMirror runtime loading.
- [x] 2026-04-29 KST: Verify Yorkie CE-03 E2E passes.
- [x] 2026-04-29 KST: Add and run the 1-7 performance benchmark harness for both candidates.
- [x] 2026-04-29 KST: Move full two-browser CE-01/CE-02 product acceptance to the walking skeleton validation path instead of blocking the engine-selection POC.
- [x] 2026-04-29 KST: Fill interim `docs/evidence.md` and `result.md`.
- [x] 2026-04-29 KST: Update ADR-0002 as the accepted sync engine decision and remove related sync ADR placeholders.

## Context and Orientation

The repository currently contains documentation, not product application code. `docs/research/poc-001-collaboration-engine/` is the research artifact location named by ADR-0002, so POC code lives there as isolated research code rather than final product code.

The top-level validation map is `docs/compliance/subject-matrix.md`. The POC gathers engine-selection evidence for `CE-01` concurrent editing, `CE-02` cursor/selection presence, `CE-03` offline reconnect merge, and `CE-05` rich/source/split preview suitability. Full CE-01/CE-02 acceptance remains part of the product walking skeleton. `CE-04` revision history is a final product requirement; in this POC it is represented by explicit checkpoint snapshot extraction from each collaboration artifact.

Provider-specific types such as Yjs, Hocuspocus, Yorkie, ProseMirror, and Tiptap must not leak into domain/product APIs. The POC checks this by keeping the shared adapter contract provider-neutral.

## Subagent Roles

The Lead/Integrator owns execution documents, workspace root, final integration, evidence/result updates, and the ADR-0002 decision update.

The Tooling/Shared subagent owns `shared/`: provider-neutral contract, seed fixture, member identities, scenario definitions, and scoring rubric.

The Tiptap subagent owns `prototypes/tiptap-yjs-hocuspocus/`: local Hocuspocus server and collaborative Tiptap editor prototype.

The Yorkie subagent owns `prototypes/yorkie-prosemirror/`: Yorkie client wiring and collaborative ProseMirror editor prototype.

QA/Evidence is performed by the Lead or delegated after prototypes are integrated. It runs the same scenarios against both candidates and records scores.

## Plan of Work

First, create a runnable POC workspace. Add `package.json` and `pnpm-workspace.yaml` under `docs/research/poc-001-collaboration-engine/`, and keep each prototype as an independent Vite app.

Second, freeze shared test assets. The seed Markdown includes a heading, paragraph, link, list, task marker, table, and code fence. Member identities are fixed as `Alice` and `Bob` with stable names and colors. Offline merge verification uses `OFFLINE_ALICE_TOKEN` and `ONLINE_BOB_TOKEN`.

Third, build both prototypes with the same UI contract. The first screen is an editor-first workspace, not a landing page. It must expose document context, member selection through query params, sync status, Source/Rich/Split/Preview modes, checkpoint action, and presence surface.

Fourth, validate both candidates with the same scenario order: two-session concurrent editing, cursor/selection movement, offline edit and reconnect, reload/rehydration, checkpoint snapshot, and Markdown mode switching.

Finally, document the evidence. `docs/evidence.md` records steps and observations. `result.md` records scores, recommendation, excluded candidate rationale, and remaining risks. ADR-0002 records the accepted sync engine decision.

## Concrete Steps

Run commands from repository root `/Users/gim-yechan/.codex/worktrees/702c/realtime-markdown-editor` unless stated otherwise.

1. Move into the POC workspace.

       cd docs/research/poc-001-collaboration-engine

2. Install dependencies.

       pnpm install

3. Run the Tiptap candidate. Use separate terminals for server and app.

       pnpm server:tiptap
       pnpm dev:tiptap

4. Run the Yorkie candidate. Use separate terminals for the local Yorkie server and app.

       yorkie server
       pnpm dev:yorkie

5. Run validation commands.

       pnpm typecheck
       pnpm build
       pnpm test

## Validation and Acceptance

`CE-01` passes when Alice and Bob open the same workspace document, edit different and adjacent positions, and converge to the same Markdown without manual refresh.

`CE-02` passes when remote cursor and selected ranges appear with stable member labels/colors and presence data does not become Markdown body content.

`CE-03` passes when Alice stays on an open page while offline, enters `OFFLINE_ALICE_TOKEN`, Bob enters `ONLINE_BOB_TOKEN` while online, and both tokens remain after reconnect.

Markdown suitability passes when heading, link, list, task marker, table, and code fence content survive Source/Rich/Split/Preview transitions and can be extracted as Markdown snapshots.

Checkpoint suitability passes when an explicit checkpoint action creates author, timestamp, message, and content snapshot data that a reviewer can inspect.

## Scoring

Total score is 100. If `CE-01`, `CE-02`, or `CE-03` cannot be reproduced, the candidate is excluded from final recommendation regardless of total score.

| Criterion | Points |
| --- | ---: |
| Concurrent editing convergence | 15 |
| Presence | 10 |
| Offline reconnect merge | 20 |
| Persistence/rehydration | 12 |
| Snapshot/history extraction | 12 |
| Markdown source/split/preview | 12 |
| Adapter boundary | 10 |
| Initial setup complexity | 9 |

## Idempotence and Recovery

All POC code stays under the research path. Do not promote it into the final product app structure. If dependency installation fails, keep package files and README instructions, then record the failed command and summarized error in `docs/evidence.md`.

If MongoDB is not available for Yorkie durability testing, validate behavior with the in-memory local server first and record server-restart persistence as a risk.

## Surprises & Discoveries

- Observation: The repository has no application/package structure yet.
  Evidence: No root `package.json`, `pnpm-workspace.yaml`, or Vite/Next config exists.
- Observation: The POC location is already documented.
  Evidence: ADR-0002 and the POC README both reference `docs/research/poc-001-collaboration-engine/` as the artifact path.
- Observation: The initial Yorkie E2E failure was not a Yorkie merge-engine conclusion.
  Evidence: The Playwright trace recorded `looks like multiple versions of prosemirror-model were loaded`; Vite had prebundled the CJS Yorkie binding with a second ProseMirror runtime copy.
- Observation: The final isolated browser/editor stack performance run uses fresh benchmark-local servers and the same readiness/convergence gates for both candidates. In the 3-run median, Tiptap is faster on initial editor visibility, first comparable readiness, peer-visible edit latency, reconnect token convergence, and large-document local edit latency; Yorkie is faster on large source commit, browser heap, measured payload, and sync-server RSS.
  Evidence: `../performance/performance-report.md` generated by `POC_PERF_RUNS=3 pnpm bench:perf`.
- Observation: Headless CRDT-only benchmark isolates algorithm-level update/merge cost and excludes browser/editor/rendering overhead.
  Evidence: `../performance/headless-crdt-report.md` generated by `pnpm bench:crdt`.
- Observation: The earlier 30s-class Yjs/Tiptap browser/editor result was a benchmark harness issue caused by an unfair readiness gate, not a live synchronization conclusion.
  Evidence: The 3-run common-gate benchmark in `../performance/performance-report.md` reports Tiptap first comparable readiness at 230.8 ms and reconnect token convergence at 11 ms.

## Decision Log

- Decision: Keep POC code isolated under `docs/research/poc-001-collaboration-engine/`.
  Rationale: The repo has no product app structure yet, and ADR-0002 names this path for POC evidence.
  Date/Author: 2026-04-29 / Codex
- Decision: Use `pnpm` as the POC package manager.
  Rationale: Workspace filters make it straightforward to run and compare both prototypes independently.
  Date/Author: 2026-04-29 / Codex
- Decision: Select Tiptap + Yjs + Hocuspocus in ADR-0002.
  Rationale: The POC evidence shows Tiptap/Yjs/Hocuspocus gives this walking skeleton enough room on reconnect convergence, live editing latency, large-document local editing, rich editor ergonomics, and initial setup complexity.
  Date/Author: 2026-04-29 / Codex

## Outcomes & Retrospective

Execution produced runnable prototypes for both candidates and verified `pnpm typecheck`, `pnpm build`, `pnpm test`, local server health, screenshot smoke, Playwright browser-context offline reconnect E2E, an isolated browser/editor stack performance benchmark, and a headless CRDT-only benchmark. ADR-0002 now selects Tiptap + Yjs + Hocuspocus because it gives this walking skeleton enough room on reconnect convergence, peer-visible edit latency, rich/source/split editor ergonomics, and initial setup complexity. Yorkie remains a strong comparison candidate if browser heap, sampled server RSS, measured payload, or large source commit become the dominant constraint. Headless CRDT-only results are treated as algorithm-level reference data, not as a ranking of the projects.
