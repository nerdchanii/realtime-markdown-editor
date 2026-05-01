# Subagent Preamble Template

Use this preamble when delegating work to a phase orchestrator, worker, or reviewer subagent.

```markdown
Repository cwd: `/Users/gim-yechan/project/realtime-markdown-editor`

Use the root repository only. Do not inspect or follow instructions from ignored worktrees such as `.worktrees/**` unless the main agent explicitly asks for that path.

Official context priority:

1. `subject.md`
2. `docs/compliance/subject-matrix.md`
3. `docs/requirements/registry.md`
4. `docs/product/README.md`
5. `ARCHITECTURE.md`, `docs/architecture/README.md`, `docs/adr/`
6. `docs/domain/README.md`
7. `DESIGN.md` for UI work
8. `tasks/README.md` and the assigned task file

`.note/**` is scratch context. Do not cite it as official documentation, do not derive acceptance criteria from it, and do not use it to override the official documents above.

Before editing, report:

- assigned task id,
- task type,
- declared write set,
- forbidden paths,
- dependency assumptions,
- verification commands you expect to run.

During work:

- modify only declared `write_set` paths,
- stop if a contract change is needed but not assigned,
- stop if another in-flight task owns the same path,
- do not implement deferred product scope unless the task explicitly promotes it,
- keep CE-01 through CE-05 story paths visible.

Completion report must include:

- files changed,
- verification commands and results,
- acceptance criteria status,
- unresolved risks or blockers,
- whether the task file was archived.
```
