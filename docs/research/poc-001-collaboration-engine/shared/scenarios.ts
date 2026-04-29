import type { PocRequirementId } from "./adapter-contract";
import { POC_MARKDOWN_ANCHORS, POC_EDIT_SNIPPETS } from "./seeded-markdown-fixture";
import { POC_MEMBER_IDS, type PocMemberId } from "./member-identities";

export type PocScenarioId =
  | "scenario-ce-01-concurrent-editing"
  | "scenario-ce-02-presence"
  | "scenario-ce-03-offline-merge"
  | "scenario-ce-04-revision-history"
  | "scenario-ce-05-rich-preview"
  | "scenario-adapter-boundary";

export type PocScoreLevel = 0 | 1 | 2 | 3;

export interface PocScoreCriterion {
  criterionId: string;
  requirementIds: readonly PocRequirementId[];
  maxPoints: number;
  passAtPoints: number;
  description: string;
  evidence: readonly string[];
}

export interface PocScenarioStep {
  stepId: string;
  actor: PocMemberId | "reviewer" | "test-runner";
  action: string;
  expected: string;
}

export interface PocScenarioDefinition {
  scenarioId: PocScenarioId;
  title: string;
  requirementIds: readonly PocRequirementId[];
  purpose: string;
  setup: readonly string[];
  steps: readonly PocScenarioStep[];
  expectedEvidence: readonly string[];
  scoringCriterionIds: readonly string[];
}

export const POC_SCORE_LEVELS = [
  {
    level: 0,
    label: "not demonstrated",
    meaning: "The prototype cannot run the scenario or loses required data.",
  },
  {
    level: 1,
    label: "partial",
    meaning: "The scenario runs only with manual refresh, manual repair, or missing evidence.",
  },
  {
    level: 2,
    label: "acceptable",
    meaning: "The scenario passes with documented limitations that do not block the CE path.",
  },
  {
    level: 3,
    label: "strong",
    meaning: "The scenario passes repeatedly with clear evidence and low reviewer setup cost.",
  },
] as const satisfies readonly {
  level: PocScoreLevel;
  label: string;
  meaning: string;
}[];

export const POC_SCORING_RUBRIC = [
  {
    criterionId: "concurrent-convergence",
    requirementIds: ["CE-01-CONCURRENT-EDITING"],
    maxPoints: 15,
    passAtPoints: 10,
    description:
      "Two members edit different Markdown ranges and both sessions converge without manual refresh.",
    evidence: [
      "Both inserted CE-01 snippets are present in both sessions.",
      "Final Markdown source strings match after waitForSynced.",
    ],
  },
  {
    criterionId: "presence-awareness",
    requirementIds: ["CE-02-PRESENCE"],
    maxPoints: 10,
    passAtPoints: 7,
    description:
      "Remote cursor and selection presence use stable workspace member identity.",
    evidence: [
      "Remote presence includes member id, display name, and color.",
      "Selection range changes appear without document refresh.",
    ],
  },
  {
    criterionId: "offline-reconnect-merge",
    requirementIds: ["CE-03-OFFLINE-MERGE"],
    maxPoints: 20,
    passAtPoints: 14,
    description:
      "An open client edits while offline, reconnects, and merges with online edits.",
    evidence: [
      "Offline local snippet remains after reconnect.",
      "Online remote snippet remains after reconnect.",
      "Both sessions converge to the same Markdown source.",
    ],
  },
  {
    criterionId: "revision-history",
    requirementIds: ["CE-04-REVISION-HISTORY"],
    maxPoints: 12,
    passAtPoints: 8,
    description:
      "User-visible checkpoint history can list and read earlier Markdown snapshots.",
    evidence: [
      "At least two checkpoint summaries include author, time, and message.",
      "Reading the first checkpoint returns Markdown before later edits.",
    ],
  },
  {
    criterionId: "rich-preview",
    requirementIds: ["CE-05-RICH-PREVIEW"],
    maxPoints: 12,
    passAtPoints: 8,
    description:
      "Rich or split preview renders Markdown source with common Markdown constructs.",
    evidence: [
      "Preview contains headings, list items, table cells, link href, and code block text.",
      "Switching source, rich, and split modes preserves Markdown body content.",
    ],
  },
  {
    criterionId: "markdown-portability",
    requirementIds: ["CE-05-RICH-PREVIEW"],
    maxPoints: 12,
    passAtPoints: 8,
    description:
      "The POC keeps the shared document body portable Markdown during editing and preview.",
    evidence: [
      "Exported or inspected source includes standard Markdown only.",
      "Preview coverage does not require product-only body syntax.",
    ],
  },
  {
    criterionId: "adapter-boundary",
    requirementIds: ["REQ-COLLAB-ENGINE-ADAPTER"],
    maxPoints: 10,
    passAtPoints: 7,
    description:
      "Prototype code hides provider internals behind the neutral adapter contract.",
    evidence: [
      "POC test harness calls only the shared adapter contract.",
      "Provider-specific objects do not cross into shared scenario assets.",
    ],
  },
  {
    criterionId: "reviewer-setup",
    requirementIds: ["REQ-COLLAB-ENGINE-ADAPTER"],
    maxPoints: 9,
    passAtPoints: 6,
    description:
      "A local reviewer can run the POC scenario path with seeded data and members.",
    evidence: [
      "Setup notes identify seeded document and members.",
      "Acceptance scenario notes map to local test or manual steps.",
    ],
  },
] as const satisfies readonly PocScoreCriterion[];

export const POC_ACCEPTANCE_SCENARIOS = [
  {
    scenarioId: "scenario-ce-01-concurrent-editing",
    title: "CE-01 concurrent editing convergence",
    requirementIds: ["CE-01-CONCURRENT-EDITING"],
    purpose:
      "Prove two members can edit one seeded Markdown document and converge without refresh.",
    setup: [
      "Open the seeded document in two independent sessions.",
      `Use ${POC_MEMBER_IDS.alice} in session A and ${POC_MEMBER_IDS.bob} in session B.`,
    ],
    steps: [
      {
        stepId: "ce01-01",
        actor: POC_MEMBER_IDS.alice,
        action: `Insert the Alice CE-01 snippet after: ${POC_MARKDOWN_ANCHORS.concurrentAlice}`,
        expected: `Session A source includes: ${POC_EDIT_SNIPPETS.concurrentAlice.trim()}`,
      },
      {
        stepId: "ce01-02",
        actor: POC_MEMBER_IDS.bob,
        action: `Insert the Bob CE-01 snippet after: ${POC_MARKDOWN_ANCHORS.concurrentBob}`,
        expected: `Session B source includes: ${POC_EDIT_SNIPPETS.concurrentBob.trim()}`,
      },
      {
        stepId: "ce01-03",
        actor: "test-runner",
        action: "Wait for both sessions to report synced state.",
        expected:
          "Both sessions expose identical Markdown source containing both inserted snippets.",
      },
    ],
    expectedEvidence: [
      "Final source equality for both sessions.",
      "No manual page refresh between edits and convergence.",
    ],
    scoringCriterionIds: ["concurrent-convergence"],
  },
  {
    scenarioId: "scenario-ce-02-presence",
    title: "CE-02 remote cursor and selection presence",
    requirementIds: ["CE-02-PRESENCE"],
    purpose:
      "Prove remote cursor and selection state is visible with stable member identity.",
    setup: [
      "Open the seeded document in two independent sessions.",
      `Use ${POC_MEMBER_IDS.alice} locally and ${POC_MEMBER_IDS.bob} remotely.`,
    ],
    steps: [
      {
        stepId: "ce02-01",
        actor: POC_MEMBER_IDS.bob,
        action:
          "Move the cursor into the Concurrent Edit Zone and select the Client B anchor line.",
        expected:
          "Session A receives remote presence for Bob with cursor and non-empty selection range.",
      },
      {
        stepId: "ce02-02",
        actor: POC_MEMBER_IDS.alice,
        action:
          "Inspect the rendered presence label, cursor color, and selection highlight.",
        expected:
          "Presence uses Bob Lee and the seeded member color for member-bob.",
      },
    ],
    expectedEvidence: [
      "Remote presence payload contains member-bob.",
      "UI or harness evidence shows display name and color from shared identities.",
    ],
    scoringCriterionIds: ["presence-awareness"],
  },
  {
    scenarioId: "scenario-ce-03-offline-merge",
    title: "CE-03 open-page offline edit and reconnect merge",
    requirementIds: ["CE-03-OFFLINE-MERGE"],
    purpose:
      "Prove local edits made while disconnected merge with remote online edits after reconnect.",
    setup: [
      "Open the seeded document in two independent sessions.",
      `Use ${POC_MEMBER_IDS.alice} for the disconnecting session and ${POC_MEMBER_IDS.bob} for the connected session.`,
    ],
    steps: [
      {
        stepId: "ce03-01",
        actor: POC_MEMBER_IDS.alice,
        action: "Set session A network availability to offline.",
        expected: "Session A remains open and editable.",
      },
      {
        stepId: "ce03-02",
        actor: POC_MEMBER_IDS.alice,
        action: `Insert the offline snippet after: ${POC_MARKDOWN_ANCHORS.offlineLocal}`,
        expected: `Session A local source includes: ${POC_EDIT_SNIPPETS.offlineLocal.trim()}`,
      },
      {
        stepId: "ce03-03",
        actor: POC_MEMBER_IDS.bob,
        action: `Insert the online snippet after: ${POC_MARKDOWN_ANCHORS.offlineRemote}`,
        expected: `Session B source includes: ${POC_EDIT_SNIPPETS.offlineRemote.trim()}`,
      },
      {
        stepId: "ce03-04",
        actor: POC_MEMBER_IDS.alice,
        action: "Set session A network availability back to online and wait for synced state.",
        expected:
          "Both sessions expose identical Markdown source containing local and remote snippets.",
      },
    ],
    expectedEvidence: [
      "Offline edit survives reconnect.",
      "Remote online edit survives reconnect.",
      "Both sessions converge to identical Markdown source.",
    ],
    scoringCriterionIds: ["offline-reconnect-merge"],
  },
  {
    scenarioId: "scenario-ce-04-revision-history",
    title: "CE-04 checkpoint history inspection",
    requirementIds: ["CE-04-REVISION-HISTORY"],
    purpose:
      "Prove user-visible history can list and read an earlier Markdown snapshot.",
    setup: [
      "Open the seeded document as a reviewer-capable member.",
      `Use ${POC_MEMBER_IDS.cora} for checkpoint authorship.`,
    ],
    steps: [
      {
        stepId: "ce04-01",
        actor: POC_MEMBER_IDS.cora,
        action: "Create a checkpoint named Baseline POC fixture.",
        expected: "History list includes the checkpoint with Cora as author.",
      },
      {
        stepId: "ce04-02",
        actor: POC_MEMBER_IDS.cora,
        action: `Append the revision evidence snippet near: ${POC_MARKDOWN_ANCHORS.revisionCheckpoint}`,
        expected: "Current source contains the CE-04 evidence snippet.",
      },
      {
        stepId: "ce04-03",
        actor: POC_MEMBER_IDS.cora,
        action: "Create a second checkpoint named Scenario edits applied.",
        expected: "History list contains both checkpoints in readable order.",
      },
      {
        stepId: "ce04-04",
        actor: "reviewer",
        action: "Open the first checkpoint snapshot.",
        expected:
          "The first snapshot does not include the later CE-04 evidence snippet.",
      },
    ],
    expectedEvidence: [
      "Checkpoint summaries show author, timestamp, and message.",
      "Earlier checkpoint content is inspectable.",
    ],
    scoringCriterionIds: ["revision-history"],
  },
  {
    scenarioId: "scenario-ce-05-rich-preview",
    title: "CE-05 rich and split Markdown preview",
    requirementIds: ["CE-05-RICH-PREVIEW"],
    purpose:
      "Prove Markdown source renders as rich preview while preserving portable source content.",
    setup: [
      "Open the seeded document.",
      "Use source, rich, and split modes if the prototype supports all three.",
    ],
    steps: [
      {
        stepId: "ce05-01",
        actor: "reviewer",
        action: "Switch to rich preview mode.",
        expected:
          "Rendered snapshot contains headings, list text, table cells, link href, and code block text.",
      },
      {
        stepId: "ce05-02",
        actor: "reviewer",
        action: "Switch to split mode and compare source with preview.",
        expected: "Source body remains unchanged and preview reflects the current Markdown.",
      },
      {
        stepId: "ce05-03",
        actor: "reviewer",
        action: "Switch back to source mode.",
        expected: "Markdown source still matches the pre-preview source string.",
      },
    ],
    expectedEvidence: [
      "Rich preview renders common Markdown constructs.",
      "Mode switching does not mutate Markdown body content.",
    ],
    scoringCriterionIds: ["rich-preview", "markdown-portability"],
  },
  {
    scenarioId: "scenario-adapter-boundary",
    title: "Shared adapter boundary inspection",
    requirementIds: ["REQ-COLLAB-ENGINE-ADAPTER"],
    purpose:
      "Prove the POC harness can run through a provider-neutral adapter boundary.",
    setup: [
      "Import or mirror the shared adapter contract.",
      "Keep provider-specific code in each prototype implementation folder.",
    ],
    steps: [
      {
        stepId: "adapter-01",
        actor: "test-runner",
        action:
          "Run acceptance scenarios through CollaborationPocAlicepter and CollaborationPocSession methods only.",
        expected:
          "Shared scenario code has no provider-specific imports or object references.",
      },
      {
        stepId: "adapter-02",
        actor: "reviewer",
        action: "Inspect prototype adapter implementation boundaries.",
        expected:
          "Provider document, awareness, selection, and transport objects remain private to the prototype adapter.",
      },
    ],
    expectedEvidence: [
      "Shared contract import path is the only shared dependency used by the scenario harness.",
      "Provider-specific types do not appear in shared assets.",
    ],
    scoringCriterionIds: ["adapter-boundary", "reviewer-setup"],
  },
] as const satisfies readonly PocScenarioDefinition[];

export const POC_TOTAL_SCORE = POC_SCORING_RUBRIC.reduce(
  (total, criterion) => total + criterion.maxPoints,
  0,
);
