import assert from 'node:assert/strict';
import test from 'node:test';

import { runHeadlessCrdtBenchmark } from './headless-crdt-benchmark.mjs';

test('headless CRDT benchmark converges offline text edits without editor runtime', () => {
  const report = runHeadlessCrdtBenchmark({
    generatedAt: '2026-04-29T00:00:00.000Z',
    runs: 1,
    largeSectionCount: 3,
    repeatEdits: 3,
  });

  assert.equal(report.scope, 'headless-crdt-text');
  assert.deepEqual(report.excludedRuntime, {
    browser: true,
    editor: true,
    provider: true,
    persistence: true,
    syncServer: true,
  });

  for (const candidate of report.candidates) {
    assert.equal(candidate.converged, true, candidate.id);
    assert.equal(candidate.finalTextA, candidate.finalTextB, candidate.id);
    assert.match(candidate.finalTextA, /Alice adds CE-01 evidence/);
    assert.match(candidate.finalTextA, /Bob adds CE-01 evidence/);
    assert.match(candidate.finalTextA, /Alice adds CE-03 evidence while offline/);
    assert.match(candidate.finalTextA, /Bob adds CE-03 evidence while online/);
    assert.ok(candidate.metrics.seedApplyMs >= 0, candidate.id);
    assert.ok(candidate.metrics.localEditMs >= 0, candidate.id);
    assert.ok(candidate.metrics.encodeUpdatesMs >= 0, candidate.id);
    assert.ok(candidate.metrics.applyRemoteUpdatesMs >= 0, candidate.id);
    assert.ok(candidate.metrics.updatePayloadBytes > 0, candidate.id);
  }
});
