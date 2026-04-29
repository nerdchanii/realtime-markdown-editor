import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'performance');

const tiptapRequire = createRequire(path.join(ROOT, 'prototypes/tiptap-yjs-hocuspocus/package.json'));
const yorkieRequire = createRequire(path.join(ROOT, 'prototypes/yorkie-prosemirror/package.json'));

const Y = tiptapRequire('yjs');
const yorkie = yorkieRequire('@yorkie-js/sdk');

const ANCHORS = {
  concurrentAlice:
    '- Client A anchor: keep the release goal visible while another member edits elsewhere.',
  concurrentBob:
    '- Client B anchor: preserve the risk list while another member edits elsewhere.',
  offlineLocal:
    '- Local offline anchor: add the disconnected client note below this item.',
  offlineRemote:
    '- Remote online anchor: add the still-connected client note below this item.',
  largeTarget: '- Large target anchor: edit latency should remain acceptable near the end.',
};

const SNIPPETS = {
  concurrentAlice:
    '\n- Alice adds CE-01 evidence: the release goal stays visible after sync.',
  concurrentBob:
    '\n- Bob adds CE-01 evidence: the risk list stays visible after sync.',
  offlineLocal:
    '\n- Alice adds CE-03 evidence while offline: local work survives reconnect.',
  offlineRemote:
    '\n- Bob adds CE-03 evidence while online: remote work merges after reconnect.',
};

const EXCLUDED_RUNTIME = {
  browser: true,
  editor: true,
  provider: true,
  persistence: true,
  syncServer: true,
};

function roundMs(value) {
  return Math.round(value * 10) / 10;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[midpoint];
  }

  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function byteLength(value) {
  return Buffer.byteLength(value, 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function measure(callback) {
  const start = performance.now();
  const value = callback();
  return {
    value,
    ms: performance.now() - start,
  };
}

function insertAfterString(current, anchor, text) {
  const index = current.indexOf(anchor);

  if (index === -1) {
    throw new Error(`Anchor not found: ${anchor}`);
  }

  return {
    index: index + anchor.length,
    text,
  };
}

function makeLargeMarkdown(sectionCount) {
  const sections = [];
  for (let index = 0; index < sectionCount; index += 1) {
    sections.push(`## Benchmark Section ${index + 1}

This paragraph exercises CRDT text insertion, update encoding, and merge convergence without editor runtime.

- Benchmark list item A ${index + 1}
- Benchmark list item B ${index + 1}
- Benchmark list item C ${index + 1}

| Field | Value |
| --- | --- |
| section | ${index + 1} |
| marker | headless payload |
`);
  }

  return `# Launch Readiness Brief

The collaboration POC uses this document to prove concurrent editing, presence,
offline merge, revision history, and rich preview without provider-specific
fixtures.

## Concurrent Edit Zone

${ANCHORS.concurrentAlice}
${ANCHORS.concurrentBob}

## Offline Merge Zone

${ANCHORS.offlineLocal}
${ANCHORS.offlineRemote}

## Large Benchmark Payload

${sections.join('\n')}

## Large Target Zone

${ANCHORS.largeTarget}

\`\`\`ts
export const headlessCrdtBenchmarkMarker = "HEADLESS_CRDT_SENTINEL";
\`\`\`
`;
}

function makeEditPlan(repeatEdits) {
  const alice = [
    { anchor: ANCHORS.concurrentAlice, text: SNIPPETS.concurrentAlice },
    { anchor: ANCHORS.offlineLocal, text: SNIPPETS.offlineLocal },
  ];
  const bob = [
    { anchor: ANCHORS.concurrentBob, text: SNIPPETS.concurrentBob },
    { anchor: ANCHORS.offlineRemote, text: SNIPPETS.offlineRemote },
  ];

  for (let index = 0; index < repeatEdits; index += 1) {
    alice.push({
      anchor: ANCHORS.largeTarget,
      text: `\n- Alice headless CRDT load edit ${index + 1}.`,
    });
    bob.push({
      anchor: ANCHORS.largeTarget,
      text: `\n- Bob headless CRDT load edit ${index + 1}.`,
    });
  }

  return { alice, bob };
}

function insertYTextAfter(yText, anchor, text) {
  const edit = insertAfterString(yText.toString(), anchor, text);
  yText.insert(edit.index, edit.text);
}

function runYjsScenario({ documentText, repeatEdits, runIndex }) {
  const seedDoc = new Y.Doc();
  seedDoc.clientID = 1000 + runIndex;
  seedDoc.getText('body').insert(0, documentText);
  const seedUpdate = Y.encodeStateAsUpdate(seedDoc);

  const docA = new Y.Doc();
  const docB = new Y.Doc();
  docA.clientID = 2000 + runIndex;
  docB.clientID = 3000 + runIndex;

  const seedApply = measure(() => {
    Y.applyUpdate(docA, seedUpdate);
    Y.applyUpdate(docB, seedUpdate);
  });

  const vectorA = Y.encodeStateVector(docA);
  const vectorB = Y.encodeStateVector(docB);
  const textA = docA.getText('body');
  const textB = docB.getText('body');
  const plan = makeEditPlan(repeatEdits);

  const localEdit = measure(() => {
    for (const edit of plan.alice) {
      insertYTextAfter(textA, edit.anchor, edit.text);
    }
    for (const edit of plan.bob) {
      insertYTextAfter(textB, edit.anchor, edit.text);
    }
  });

  const encodeUpdates = measure(() => ({
    updateA: Y.encodeStateAsUpdate(docA, vectorA),
    updateB: Y.encodeStateAsUpdate(docB, vectorB),
  }));

  const applyRemoteUpdates = measure(() => {
    Y.applyUpdate(docA, encodeUpdates.value.updateB);
    Y.applyUpdate(docB, encodeUpdates.value.updateA);
  });

  const finalTextA = textA.toString();
  const finalTextB = textB.toString();
  const payload = Buffer.concat([
    Buffer.from(encodeUpdates.value.updateA),
    Buffer.from(encodeUpdates.value.updateB),
  ]);

  return {
    id: 'yjs',
    label: 'Yjs Y.Text',
    converged: finalTextA === finalTextB,
    finalTextA,
    finalTextB,
    metrics: {
      seedApplyMs: roundMs(seedApply.ms),
      localEditMs: roundMs(localEdit.ms),
      encodeUpdatesMs: roundMs(encodeUpdates.ms),
      applyRemoteUpdatesMs: roundMs(applyRemoteUpdates.ms),
      updatePayloadBytes: payload.byteLength,
      gzipPayloadBytes: gzipSync(payload).byteLength,
      finalTextBytes: byteLength(finalTextA),
      operationCount: plan.alice.length + plan.bob.length,
    },
  };
}

function insertYorkieTextAfter(yText, anchor, text) {
  const edit = insertAfterString(yText.toString(), anchor, text);
  yText.edit(edit.index, edit.index, edit.text);
}

function yorkieChangesPayloadBytes(changes) {
  return changes.reduce((total, change) => total + byteLength(JSON.stringify(change.toStruct())), 0);
}

function yorkieChangesPayloadBuffer(changes) {
  return Buffer.from(changes.map((change) => JSON.stringify(change.toStruct())).join('\n'), 'utf8');
}

function runYorkieScenario({ documentText, repeatEdits, runIndex }) {
  const key = `headless-crdt-${runIndex}`;
  const seed = new yorkie.Document(key);
  seed.setActor('000000000000000000000001');
  seed.update((root) => {
    root.body = new yorkie.Text();
    root.body.edit(0, 0, documentText);
  }, 'seed');
  const seedChanges = seed.createChangePack().getChanges();

  const docA = new yorkie.Document(key);
  const docB = new yorkie.Document(key);
  docA.setActor('00000000000000000000000a');
  docB.setActor('00000000000000000000000b');

  const seedApply = measure(() => {
    docA.applyChanges(seedChanges, yorkie.OpSource.Remote);
    docB.applyChanges(seedChanges, yorkie.OpSource.Remote);
  });

  const plan = makeEditPlan(repeatEdits);
  const localEdit = measure(() => {
    docA.update((root) => {
      for (const edit of plan.alice) {
        insertYorkieTextAfter(root.body, edit.anchor, edit.text);
      }
    }, 'alice-offline-edits');
    docB.update((root) => {
      for (const edit of plan.bob) {
        insertYorkieTextAfter(root.body, edit.anchor, edit.text);
      }
    }, 'bob-offline-edits');
  });

  const encodeUpdates = measure(() => ({
    changesA: docA.createChangePack().getChanges(),
    changesB: docB.createChangePack().getChanges(),
  }));

  const applyRemoteUpdates = measure(() => {
    docA.applyChanges(encodeUpdates.value.changesB, yorkie.OpSource.Remote);
    docB.applyChanges(encodeUpdates.value.changesA, yorkie.OpSource.Remote);
  });

  const finalTextA = docA.getRoot().body.toString();
  const finalTextB = docB.getRoot().body.toString();
  const payloadBytes =
    yorkieChangesPayloadBytes(encodeUpdates.value.changesA) +
    yorkieChangesPayloadBytes(encodeUpdates.value.changesB);
  const payload = Buffer.concat([
    yorkieChangesPayloadBuffer(encodeUpdates.value.changesA),
    yorkieChangesPayloadBuffer(encodeUpdates.value.changesB),
  ]);

  return {
    id: 'yorkie',
    label: 'Yorkie Text',
    converged: finalTextA === finalTextB,
    finalTextA,
    finalTextB,
    metrics: {
      seedApplyMs: roundMs(seedApply.ms),
      localEditMs: roundMs(localEdit.ms),
      encodeUpdatesMs: roundMs(encodeUpdates.ms),
      applyRemoteUpdatesMs: roundMs(applyRemoteUpdates.ms),
      updatePayloadBytes: payloadBytes,
      gzipPayloadBytes: gzipSync(payload).byteLength,
      finalTextBytes: byteLength(finalTextA),
      operationCount: plan.alice.length + plan.bob.length,
    },
  };
}

function summarizeCandidate(id, label, runs) {
  const metrics = {};
  for (const key of Object.keys(runs[0].metrics)) {
    metrics[key] = roundMs(median(runs.map((run) => run.metrics[key])));
  }

  const lastRun = runs.at(-1);
  return {
    id,
    label,
    converged: runs.every((run) => run.converged),
    finalTextA: lastRun.finalTextA,
    finalTextB: lastRun.finalTextB,
    metrics,
  };
}

export function runHeadlessCrdtBenchmark({
  generatedAt = new Date().toISOString(),
  runs = Number.parseInt(process.env.POC_CRDT_RUNS ?? '5', 10),
  largeSectionCount = Number.parseInt(process.env.POC_CRDT_LARGE_SECTIONS ?? '60', 10),
  repeatEdits = Number.parseInt(process.env.POC_CRDT_REPEAT_EDITS ?? '20', 10),
} = {}) {
  const documentText = makeLargeMarkdown(largeSectionCount);
  const rawRuns = {
    yjs: [],
    yorkie: [],
  };

  for (let runIndex = 0; runIndex < runs; runIndex += 1) {
    rawRuns.yjs.push(runYjsScenario({ documentText, repeatEdits, runIndex }));
    rawRuns.yorkie.push(runYorkieScenario({ documentText, repeatEdits, runIndex }));
  }

  return {
    title: 'POC-001 Headless CRDT Text Benchmark',
    scope: 'headless-crdt-text',
    generatedAt,
    runs,
    largeSectionCount,
    repeatEdits,
    sourceDocumentBytes: byteLength(documentText),
    excludedRuntime: EXCLUDED_RUNTIME,
    candidates: [
      summarizeCandidate('yjs', 'Yjs Y.Text', rawRuns.yjs),
      summarizeCandidate('yorkie', 'Yorkie Text', rawRuns.yorkie),
    ],
    rawRuns,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function renderMarkdownReport(report) {
  const rows = report.candidates
    .map((candidate) => {
      const metrics = candidate.metrics;
      return `| ${candidate.label} | ${candidate.converged ? '예' : '아니오'} | ${metrics.seedApplyMs} | ${metrics.localEditMs} | ${metrics.encodeUpdatesMs} | ${metrics.applyRemoteUpdatesMs} | ${formatBytes(metrics.updatePayloadBytes)} | ${formatBytes(metrics.gzipPayloadBytes)} |`;
    })
    .join('\n');

  const json = JSON.stringify(
    Object.fromEntries(report.candidates.map((candidate) => [candidate.id, candidate.metrics])),
    null,
    2,
  );

  return `---
title: POC-001 Headless CRDT Text Benchmark
status: measured
generated_at: ${report.generatedAt}
---

# POC-001 Headless CRDT Text Benchmark

## 범위

이 benchmark는 in-memory text CRDT layer만 비교한다. Browser rendering, Tiptap, ProseMirror, provider reconnect policy, IndexedDB 또는 다른 persistence, sync server는 제외한다.

시나리오는 두 local document replica가 같은 seeded Markdown string을 독립적으로 편집하게 해서 disconnected period를 모사한다. Reconnect는 생성된 CRDT update를 한 번 교환하고 convergence를 확인하는 방식으로 모델링한다.

이는 engine-level diagnostic benchmark다. \`performance-report.md\`의 browser/editor stack benchmark를 대체하지 않고, 함께 읽어야 한다.

## 조건

- 실행 횟수: ${report.runs}
- Source document: ${formatBytes(report.sourceDocumentBytes)}
- Large sections: ${report.largeSectionCount}
- Peer별 repeated load edits: ${report.repeatEdits}
- 제외 runtime: browser, editor, provider, persistence, sync server

## 요약 표

| 후보 | 수렴 | seed 적용 ms | local edit ms | update encode ms | remote update 적용 ms | update payload proxy | gzip payload proxy |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## 해석

이 수치는 CRDT text operation cost와 update exchange cost만 분리한다. Markdown parsing, rich editor transaction mapping, DOM updates, awareness/presence, network reconnect backoff, local cache startup, server process overhead는 포함하지 않는다.

이전 30초대 결과는 browser/editor stack 경로의 오탐이며, CRDT engine-only 결론으로 사용하면 안 된다.

Cross-engine final text hash는 concurrent insert ordering이 implementation-defined라 서로 다를 수 있다. 이 benchmark는 서로 다른 CRDT implementation 사이의 동일 ordering이 아니라, 같은 engine replica 간 convergence를 확인한다.

Payload bytes는 wire-level network capture가 아니라 local serialization proxy다. Yjs는 binary update bytes를 사용한다. Yorkie는 이 headless 경로에서 Yorkie RPC transport를 의도적으로 제외하므로 serialized local change struct를 사용한다.

## 상세 Median Metrics

\`\`\`json
${json}
\`\`\`
`;
}

function compactCandidate(candidate) {
  return {
    id: candidate.id,
    label: candidate.label,
    converged: candidate.converged,
    finalTextSha256A: sha256(candidate.finalTextA),
    finalTextSha256B: sha256(candidate.finalTextB),
    finalTextBytesA: byteLength(candidate.finalTextA),
    finalTextBytesB: byteLength(candidate.finalTextB),
    metrics: candidate.metrics,
  };
}

function compactRun(run) {
  return compactCandidate(run);
}

function compactReport(report) {
  return {
    ...report,
    candidates: report.candidates.map(compactCandidate),
    rawRuns: Object.fromEntries(
      Object.entries(report.rawRuns).map(([candidateId, runs]) => [
        candidateId,
        runs.map(compactRun),
      ]),
    ),
  };
}

async function writeReport(report) {
  await mkdir(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, 'headless-crdt-results.json');
  const markdownPath = path.join(OUT_DIR, 'headless-crdt-report.md');

  await writeFile(jsonPath, `${JSON.stringify(compactReport(report), null, 2)}\n`);
  await writeFile(markdownPath, renderMarkdownReport(report));

  return { jsonPath, markdownPath };
}

async function main() {
  const report = runHeadlessCrdtBenchmark();
  const { jsonPath, markdownPath } = await writeReport(report);
  console.log(`Wrote ${path.relative(ROOT, markdownPath)}`);
  console.log(`Wrote ${path.relative(ROOT, jsonPath)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
