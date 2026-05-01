---
title: Auto Phase Loop
status: active
purpose: post-exec-plan autonomous operating loop
---

# Auto Phase Loop

Use this procedure after the primary exec-plan gates pass. It keeps autonomous work tied to
official requirements and task-boundary checkpoints.

## 1. Discovery

- Inspect `docs/requirements/registry.md` and `docs/product/**` for requirements or product
  surfaces that are unimplemented or only partially implemented.
- Do not use `.note/**` as official evidence.
- For each candidate, record official source, user value, likely write set, dependency/blocker,
  verification candidate, and CE-01 through CE-05 impact.

## 2. Critic

- Review candidates before implementation.
- Defer candidates with weak official grounding, CE path risk, oversized scope, boundary changes,
  new dependencies, dirty-worktree conflicts, or policy decisions needing approval.

## 3. Phase Selection

- Select one small phase at a time, preferably one to three tasks.
- Track CE story acceptance/reviewer clarity, then small independent product surfaces, clear
  verification, and low write-set collision risk.

## 4. Phase Plan

- Write `tasks/exec-plan/auto-YYYYMMDD-HHMM-<slug>.md`.
- Include goal, official inputs, execution graph, task IDs, write sets, forbidden paths,
  acceptance, verification, archive rules, and checkpoint criteria.
- Self-review the plan before implementation.

## 5. Execution

- Materialize task files from `tasks/_templates/TASK-TEMPLATE.md`.
- Move each task through `tasks/todo/` -> `tasks/active/` -> `tasks/archive/`.
- Use subagents for independent work and include `tasks/_templates/SUBAGENT-PREAMBLE.md`.
- Keep worker write sets disjoint and stop downstream work if a contract change is needed.

## 6. Verification

- Run each task's verification before archiving.
- Boundary-adjacent changes include `pnpm arch:check`.
- CE work includes targeted e2e specs.
- Use a critic/reviewer after implementation to check acceptance, write set, verification,
  CE path, and official-doc alignment.

## 7. Checkpoint Commit

- Commit only at verified task boundaries.
- Check `git status --short` before and after each commit.
- Stage files explicitly; never use `git add .`.
- Commit only if acceptance passed, verification was run and recorded, actual files are inside
  the declared write set, the task is archived, and no unrelated changes are staged.

## 8. Cleanup

- Close completed, failed, blocked, or stale subagents after collecting final reports.
- Keep only subagents directly needed for the current phase.
- At phase end, record active subagents, completed tasks, commits, verification, blockers,
  CE story status, and next recommended action.

## 9. Stop Conditions

Stop or defer instead of implementing when all remaining tasks are blocked, destructive action is
needed, security/data-loss risk appears, official requirements conflict, user approval is required,
or a candidate would add unofficial product scope, dependencies, boundary changes, or unrelated
refactors.
