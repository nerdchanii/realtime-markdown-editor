import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPARABLE_READINESS_GATES,
  createBenchmarkCandidates,
  formatReport,
  summarizeRuns,
} from './performance-benchmark.mjs';

describe('performance benchmark comparable gates', () => {
  it('uses the same first-ready gate sequence for both candidates', () => {
    assert.deepEqual(
      COMPARABLE_READINESS_GATES.map((gate) => gate.id),
      ['editor-visible', 'transport-ready', 'seed-visible'],
    );
  });

  it('uses isolated benchmark ports and env wiring for both candidates', () => {
    const [tiptap, yorkie] = createBenchmarkCandidates(19000);

    assert.deepEqual(tiptap.syncPorts, [19234, 19235]);
    assert.equal(tiptap.appPort, 19174);
    assert.equal(tiptap.syncEnv.HOCUSPOCUS_PORT, '19234');
    assert.equal(tiptap.syncEnv.CHECKPOINT_PORT, '19235');
    assert.equal(tiptap.appEnv.VITE_HOCUSPOCUS_URL, 'ws://127.0.0.1:19234');
    assert.equal(tiptap.appEnv.VITE_CHECKPOINT_API, 'http://127.0.0.1:19235');

    assert.deepEqual(yorkie.syncPorts, [19080]);
    assert.equal(yorkie.appPort, 19175);
    assert.deepEqual(yorkie.syncCommand, ['yorkie', ['server', '--rpc-port', '19080', '--log-level', 'error']]);
    assert.equal(yorkie.appEnv.VITE_YORKIE_RPC_ADDR, 'http://127.0.0.1:19080');
  });

  it('summarizes comparable readiness rather than candidate-specific sync readiness', () => {
    const summary = summarizeRuns([
      {
        initialEditorVisibleMs: 120,
        firstComparableReadyMs: 180,
        navigation: { firstContentfulPaintMs: 90 },
        editLatency: { localEditEchoMs: 12, remoteEditVisibleMs: 80 },
        reconnectConvergenceMs: 140,
        largeDocument: {
          sourceCommitMs: 200,
          richRenderAfterSourceMs: 210,
          localEditEchoMs: 14,
          sourceReflectionMs: 28,
        },
        memory: {
          afterFirstReady: { jsHeapUsedBytes: 4 * 1024 * 1024 },
          afterReconnect: { jsHeapUsedBytes: 5 * 1024 * 1024 },
          afterLargeDocument: {
            jsHeapUsedBytes: 6 * 1024 * 1024,
            domNodes: 300,
          },
        },
        network: {
          httpBytes: 100,
          wsSentBytes: 20,
          wsReceivedBytes: 30,
        },
        serverProcesses: {
          syncServer: { peakRssKb: 64 * 1024, peakCpuPercent: 4 },
          appServer: { peakRssKb: 96 * 1024, peakCpuPercent: 6 },
        },
      },
    ]);

    assert.equal(summary.initialEditorVisibleMs, 120);
    assert.equal(summary.firstComparableReadyMs, 180);
    assert.equal(summary.browserHeapAfterFirstReadyMb, 4);
  });

  it('labels the report with comparable readiness, not first sync', () => {
    const report = formatReport({
      generatedAt: '2026-04-29T00:00:00.000Z',
      runCount: 1,
      largeDocument: { sectionCount: 1, bytes: 1024 },
      candidates: [
        {
          id: 'tiptap',
          label: 'Tiptap',
          bundle: { rawBytes: 1024, gzipBytes: 512 },
          summary: {
            initialEditorVisibleMs: 120,
            firstComparableReadyMs: 180,
            remoteEditVisibleMs: 80,
            reconnectConvergenceMs: 140,
            largeSourceCommitMs: 200,
            largeLocalEditEchoMs: 14,
            browserHeapAfterLargeMb: 6,
            networkHttpBytes: 100,
            networkWsSentBytes: 20,
            networkWsReceivedBytes: 30,
            syncServerPeakRssMb: 64,
          },
          runs: [{ readinessPhases: { first: { seedVisibleMs: 180 } } }],
        },
      ],
    });

    assert.match(report, /공통 ready gate ms/);
    assert.doesNotMatch(report, /first sync ready ms/i);
    assert.match(report, /같은 gate sequence/);
  });
});
