# Real-time Markdown Editor

Real-time Markdown Editor is a collaborative markdown editing platform with a walking-skeleton implementation target.

## Current status

- Walking skeleton in progress.
- CE-01 ~ CE-05 are the reviewer path and should be treated as the primary acceptance path.
- CE behavior is not fully implemented yet; this README is intentionally minimal.

## Prerequisites

- Node.js 24
- pnpm 10.28.2

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

## Checks

```bash
pnpm check
pnpm test:e2e
```

- CE e2e specs are executable acceptance targets and may fail until product implementation catches up to all CE expectations.

## Seeded review identities (e2e)

- `alice`
- `bob`
- Document: `seed-review-plan`

## Official documentation

- [subject.md](./subject.md)
- [docs/compliance/subject-matrix.md](./docs/compliance/subject-matrix.md)
- [docs/requirements/registry.md](./docs/requirements/registry.md)
- [docs/product/README.md](./docs/product/README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
