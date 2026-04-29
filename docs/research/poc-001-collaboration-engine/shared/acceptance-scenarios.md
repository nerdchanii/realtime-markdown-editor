---
title: docs/research/poc-001-collaboration-engine/shared/acceptance-scenarios.md
status: active
---

# Playwright-Style Acceptance Scenario Notes

These notes are intentionally provider-neutral. Each prototype can convert them
to local Playwright tests, or use them as manual evidence steps. Prefer importing
the shared TypeScript assets:

```ts
import {
  getPocMember,
  POC_ACCEPTANCE_SCENARIOS,
  POC_MEMBER_IDS,
  POC_MEMBERS,
  SEEDED_MARKDOWN_FIXTURE,
} from "../shared";
```

## Shared Test Assumptions

- Each prototype can open the seeded workspace document from
  `SEEDED_MARKDOWN_FIXTURE.document`.
- Each browser context can select a seeded member identity from
  `POC_MEMBER_IDS`.
- The editor exposes a stable source editor surface, preview surface, presence
  surface, history surface, and sync status surface.
- If exact selectors differ by prototype, keep the assertions and evidence the
  same.

Suggested semantic handles:

| Handle | Purpose |
| --- | --- |
| `data-poc-editor-source` | Markdown source editor surface. |
| `data-poc-preview` | Rich or split preview surface. |
| `data-poc-sync-status` | Current sync or connection status. |
| `data-poc-presence-member="<memberId>"` | Remote presence label or marker. |
| `data-poc-history-list` | Checkpoint or revision list. |
| `data-poc-history-snapshot` | Read-only revision snapshot viewer. |

## CE-01 Concurrent Editing

```ts
test("CE-01 two members converge on the same Markdown source", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();

  await openSeededDocument(alicePage, POC_MEMBER_IDS.alice);
  await openSeededDocument(bobPage, POC_MEMBER_IDS.bob);

  await insertAfterAnchor(alicePage, "concurrentAlice");
  await insertAfterAnchor(bobPage, "concurrentBob");

  await expectSynced(alicePage);
  await expectSynced(bobPage);

  const aliceSource = await markdownSource(alicePage);
  const bobSource = await markdownSource(bobPage);
  expect(aliceSource).toBe(bobSource);
  expect(aliceSource).toContain("Alice adds CE-01 evidence");
  expect(bobSource).toContain("Bob adds CE-01 evidence");
});
```

Evidence to capture:

- Source equality after both sessions report synced.
- Both CE-01 snippets visible without manual refresh.

## CE-02 Presence

```ts
test("CE-02 remote cursor and selection use seeded member identity", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();

  await openSeededDocument(alicePage, POC_MEMBER_IDS.alice);
  await openSeededDocument(bobPage, POC_MEMBER_IDS.bob);

  await selectAnchorLine(bobPage, "concurrentBob");

  await expect(alicePage.locator('[data-poc-presence-member="member-bob"]')).toBeVisible();
  await expect(alicePage.locator('[data-poc-presence-member="member-bob"]')).toContainText("Bob Lee");
});
```

Evidence to capture:

- Remote cursor or selection appears in Alice's session.
- Label and color come from the shared seeded member identity.

## CE-03 Offline Merge

```ts
test("CE-03 offline local edits merge with online remote edits after reconnect", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();

  await openSeededDocument(alicePage, POC_MEMBER_IDS.alice);
  await openSeededDocument(bobPage, POC_MEMBER_IDS.bob);

  await alice.setOffline(true);
  await insertAfterAnchor(alicePage, "offlineLocal");
  await insertAfterAnchor(bobPage, "offlineRemote");

  await alice.setOffline(false);
  await expectSynced(alicePage);
  await expectSynced(bobPage);

  const aliceSource = await markdownSource(alicePage);
  const bobSource = await markdownSource(bobPage);
  await expect(aliceSource).toBe(bobSource);
  await expect(aliceSource).toContain("local work survives reconnect");
  await expect(aliceSource).toContain("remote work merges after reconnect");
});
```

Evidence to capture:

- The offline session remains editable while disconnected.
- Both local and remote unique snippets survive reconnect.
- Both sessions converge to identical Markdown source.

## CE-04 Revision History

```ts
test("CE-04 reviewer can inspect an earlier checkpoint snapshot", async ({ page }) => {
  await openSeededDocument(page, POC_MEMBER_IDS.cora);

  await createCheckpoint(page, "Baseline POC fixture");
  await insertAfterAnchor(page, "revisionCheckpoint");
  await createCheckpoint(page, "Scenario edits applied");

  await openHistory(page);
  await expect(page.locator("[data-poc-history-list]")).toContainText("Baseline POC fixture");
  await expect(page.locator("[data-poc-history-list]")).toContainText("Scenario edits applied");

  await openCheckpoint(page, "Baseline POC fixture");
  await expect(page.locator("[data-poc-history-snapshot]")).not.toContainText("Cora adds CE-04 evidence");
});
```

Evidence to capture:

- Checkpoint list includes author, timestamp, and message.
- Earlier snapshot is readable and excludes later edits.

## CE-05 Rich Preview

```ts
test("CE-05 rich and split modes render Markdown without mutating source", async ({ page }) => {
  await openSeededDocument(page, POC_MEMBER_IDS.alice);
  const beforePreview = await markdownSource(page);

  await switchEditorMode(page, "rich");
  await expect(page.locator("[data-poc-preview]")).toContainText("Launch Readiness Brief");
  await expect(page.locator("[data-poc-preview]")).toContainText("Preview Coverage");
  await expect(page.locator("[data-poc-preview]")).toContainText("CE-05");
  await expect(page.locator("[data-poc-preview] a[href='./decision-log.md']")).toBeVisible();

  await switchEditorMode(page, "split");
  await expect(page.locator("[data-poc-preview]")).toContainText("Markdown code blocks render");

  await switchEditorMode(page, "source");
  await expect(await markdownSource(page)).toBe(beforePreview);
});
```

Evidence to capture:

- Preview renders heading, list, table, link, and code block content.
- Source, rich, and split mode switching preserves Markdown body content.

## Alicepter Boundary Check

```ts
test("shared acceptance harness uses only the neutral POC adapter", async () => {
  const adapter = await createPrototypeAdapter();
  const session = await adapter.openDocument({
    document: SEEDED_MARKDOWN_FIXTURE.document,
    initialMarkdown: SEEDED_MARKDOWN_FIXTURE.markdown,
    localMember: getPocMember(POC_MEMBER_IDS.alice),
    knownMembers: POC_MEMBERS,
  });

  await session.waitForSynced();
  await expect(await session.getMarkdown()).toContain("Launch Readiness Brief");
  await session.close();
});
```

Evidence to capture:

- Shared scenario code imports only from `shared/index.ts`.
- Provider-specific objects stay inside prototype adapter implementations.
