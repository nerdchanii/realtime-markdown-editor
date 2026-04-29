import { chromium } from '@playwright/test';
import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createConnection } from 'node:net';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { gzipSync } from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'performance');
const RUNS = Number.parseInt(process.env.POC_PERF_RUNS ?? '1', 10);
const LARGE_SECTION_COUNT = Number.parseInt(process.env.POC_PERF_LARGE_SECTIONS ?? '60', 10);
const PORT_BASE = Number.parseInt(process.env.POC_PERF_PORT_BASE ?? '19000', 10);
const SEED_VISIBLE_TEXT = 'Launch Readiness Brief';
const COMPARABLE_READINESS_GATES = [
  {
    id: 'editor-visible',
    description: 'The requested editor surface is mounted and visible.',
  },
  {
    id: 'transport-ready',
    description: 'The collaboration transport reports ready for the active document.',
  },
  {
    id: 'seed-visible',
    description: 'The shared seed document marker is visible in the requested editor surface.',
  },
];
const CANDIDATE_FILTER = (process.env.POC_PERF_CANDIDATES ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const nowIso = new Date().toISOString();

function createBenchmarkCandidates(portBase = PORT_BASE) {
  const tiptapAppPort = portBase + 174;
  const tiptapHocuspocusPort = portBase + 234;
  const tiptapCheckpointPort = portBase + 235;
  const yorkieAppPort = portBase + 175;
  const yorkieRpcPort = portBase + 80;

  return [
    {
      id: 'tiptap',
      label: 'Tiptap + Yjs + Hocuspocus',
      appPort: tiptapAppPort,
      syncPorts: [tiptapHocuspocusPort, tiptapCheckpointPort],
      appPorts: [tiptapAppPort],
      bundleDir: path.join(ROOT, 'prototypes/tiptap-yjs-hocuspocus/dist/assets'),
      appCommand: [
        'pnpm',
        ['--filter', '@poc/tiptap-yjs-hocuspocus', 'exec', 'vite', '--host', '127.0.0.1', '--port', String(tiptapAppPort)],
      ],
      appEnv: {
        VITE_HOCUSPOCUS_URL: `ws://127.0.0.1:${tiptapHocuspocusPort}`,
        VITE_CHECKPOINT_API: `http://127.0.0.1:${tiptapCheckpointPort}`,
      },
      syncCommand: ['pnpm', ['--filter', '@poc/tiptap-yjs-hocuspocus', 'run', 'server']],
      syncEnv: {
        HOCUSPOCUS_PORT: String(tiptapHocuspocusPort),
        CHECKPOINT_PORT: String(tiptapCheckpointPort),
      },
      sourceParam: 'document',
    },
    {
      id: 'yorkie',
      label: 'Yorkie + ProseMirror',
      appPort: yorkieAppPort,
      syncPorts: [yorkieRpcPort],
      appPorts: [yorkieAppPort],
      bundleDir: path.join(ROOT, 'prototypes/yorkie-prosemirror/dist/assets'),
      appCommand: [
        'pnpm',
        ['--filter', '@poc/yorkie-prosemirror', 'exec', 'vite', '--host', '127.0.0.1', '--port', String(yorkieAppPort)],
      ],
      appEnv: {
        VITE_YORKIE_RPC_ADDR: `http://127.0.0.1:${yorkieRpcPort}`,
      },
      syncCommand: ['yorkie', ['server', '--rpc-port', String(yorkieRpcPort), '--log-level', 'error']],
      syncEnv: {},
      sourceParam: 'doc',
    },
  ];
}

const candidates = createBenchmarkCandidates();

const activeCandidates =
  CANDIDATE_FILTER.length > 0 ? candidates.filter((candidate) => CANDIDATE_FILTER.includes(candidate.id)) : candidates;

const managedProcesses = [];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: ROOT }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve(stdout.toString());
    });
  });
}

function isTcpPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1_000);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function waitUntil(label, probe, timeoutMs = 30_000, intervalMs = 100) {
  const start = performance.now();
  let lastError;

  while (performance.now() - start < timeoutMs) {
    try {
      if (await probe()) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(intervalMs);
  }

  throw new Error(`${label} timed out${lastError ? `: ${lastError.message}` : ''}`);
}

async function ensurePortServer({ label, port, command, env = {}, reuseExisting = false }) {
  if (await isTcpPortOpen(port)) {
    if (reuseExisting) {
      return { label, port, reused: true };
    }

    throw new Error(`${label} port ${port} is already in use; set POC_PERF_PORT_BASE to an unused range`);
  }

  const [bin, args] = command;
  const child = spawn(bin, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      ...env,
      FORCE_COLOR: '0',
      NO_COLOR: '1',
    },
    stdio: 'ignore',
  });
  child.unref();
  managedProcesses.push(child);

  await waitUntil(`${label} on ${port}`, () => isTcpPortOpen(port), 45_000, 250);
  return { label, port, reused: false, pid: child.pid };
}

function candidateUrl(candidate, user, documentName, mode = 'rich') {
  const params = new URLSearchParams({
    user,
    mode,
    [candidate.sourceParam]: documentName,
  });
  return `http://127.0.0.1:${candidate.appPort}/?${params.toString()}`;
}

async function readTransportState(candidate, page) {
  if (candidate.id === 'tiptap') {
    const connectionStatus = await page
      .locator('[data-poc-connection-status]')
      .first()
      .getAttribute('data-poc-connection-status')
      .catch(() => '');
    const localCacheStatus = await page
      .locator('[data-poc-local-cache-status]')
      .first()
      .getAttribute('data-poc-local-cache-status')
      .catch(() => '');

    return {
      ready: connectionStatus === 'connected',
      connectionStatus,
      localCacheStatus,
    };
  }

  const connectionStatus = await page
    .locator('[data-poc-status="connection"]')
    .first()
    .textContent()
    .catch(() => '');
  const syncStatus = await page
    .locator('[data-poc-status="sync"]')
    .first()
    .textContent()
    .catch(() => '');

  return {
    ready: Boolean(connectionStatus?.includes('online') && syncStatus?.includes('synced')),
    connectionStatus,
    syncStatus,
  };
}

async function waitForTransportReady(candidate, page) {
  await waitUntil(`${candidate.id} transport ready`, async () => {
    const state = await readTransportState(candidate, page);
    return state.ready;
  });
}

function editorSurfaceLocator(page, mode) {
  if (mode === 'source') {
    return page.locator('[data-poc-editor-source]').first();
  }

  return page.locator('[data-poc-rich-editor] [contenteditable="true"]').first();
}

async function seedVisibleInSurface(page, mode) {
  if (mode === 'source') {
    const sourceValue = await page.locator('[data-poc-editor-source]').first().inputValue().catch(() => '');
    return sourceValue.includes(SEED_VISIBLE_TEXT);
  }

  const richText = await page.locator('[data-poc-rich-editor]').first().textContent().catch(() => '');
  return richText?.includes(SEED_VISIBLE_TEXT);
}

async function waitForComparableReadiness(candidate, page, { mode = 'rich', startedAt = performance.now() } = {}) {
  const phaseTimings = {};
  const mark = (phase) => {
    phaseTimings[phase] = performance.now() - startedAt;
  };

  await waitUntil(`${candidate.id} ${mode} editor visible`, () => editorSurfaceLocator(page, mode).isVisible().catch(() => false));
  mark('editorVisibleMs');

  await waitForTransportReady(candidate, page);
  mark('transportReadyMs');

  await waitUntil(`${candidate.id} seed visible in ${mode}`, () => seedVisibleInSurface(page, mode));
  mark('seedVisibleMs');

  return Object.fromEntries(
    Object.entries(phaseTimings).map(([key, value]) => [key, round(value, 1)]),
  );
}

async function readCandidateDebug(candidate, page) {
  if (candidate.id !== 'tiptap') {
    return {
      transport: await readTransportState(candidate, page),
    };
  }

  return page.evaluate(() => ({
    transport: null,
    seed: window.__pocSeedDebug ?? null,
  })).then(async (debug) => ({
    ...debug,
    transport: await readTransportState(candidate, page),
  }));
}

async function richContains(page, token) {
  const text = await page.locator('[data-poc-rich-editor]').first().textContent().catch(() => '');
  return text?.includes(token);
}

async function sourceContains(page, token) {
  const source = page.locator('[data-poc-editor-source]').first();
  if (!(await source.isVisible().catch(() => false))) {
    await page.getByRole('tab', { name: /source/i }).click();
  }
  const value = await source.inputValue();
  return value.includes(token);
}

async function insertAfterAnchor(page, anchor, token) {
  const inserted = await page.evaluate(
    ([targetAnchor, targetText]) => window.__pocInsertTextAfterAnchor?.(targetAnchor, targetText) ?? false,
    [anchor, token],
  );
  if (!inserted) {
    throw new Error(`Could not insert ${token} after ${anchor}`);
  }
  await waitUntil(`local token ${token}`, () => richContains(page, token));
}

function makeDocumentName(candidateId, runIndex, suffix) {
  return `perf-${candidateId}-${Date.now()}-${runIndex}-${suffix}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeLargeMarkdown(sectionCount) {
  const sections = [];
  for (let index = 0; index < sectionCount; index += 1) {
    sections.push(`## Benchmark Section ${index + 1}

This paragraph exercises Markdown parsing, rich editor conversion, collaboration sync, and preview rendering for repeatable performance comparison.

- Benchmark list item A ${index + 1}
- Benchmark list item B ${index + 1}
- Benchmark list item C ${index + 1}

| Field | Value |
| --- | --- |
| section | ${index + 1} |
| marker | repeated payload |
`);
  }

  return `# Large Benchmark Document

${sections.join('\n')}

## Large Target Zone

- Large target anchor: edit latency should remain acceptable near the end.

\`\`\`ts
export const largeBenchmarkMarker = "LARGE_DOC_SENTINEL";
\`\`\`
`;
}

async function attachNetworkMetrics(page) {
  const cdp = await page.context().newCDPSession(page);
  const metrics = {
    httpBytes: 0,
    httpRequests: 0,
    wsSentBytes: 0,
    wsReceivedBytes: 0,
    wsFramesSent: 0,
    wsFramesReceived: 0,
  };

  await cdp.send('Network.enable');
  cdp.on('Network.loadingFinished', (event) => {
    metrics.httpRequests += 1;
    metrics.httpBytes += event.encodedDataLength ?? 0;
  });
  cdp.on('Network.webSocketFrameSent', (event) => {
    metrics.wsFramesSent += 1;
    metrics.wsSentBytes += Buffer.byteLength(event.response?.payloadData ?? '', 'utf8');
  });
  cdp.on('Network.webSocketFrameReceived', (event) => {
    metrics.wsFramesReceived += 1;
    metrics.wsReceivedBytes += Buffer.byteLength(event.response?.payloadData ?? '', 'utf8');
  });

  return {
    metrics,
    detach: () => cdp.detach().catch(() => {}),
  };
}

async function getBrowserMetrics(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const response = await cdp.send('Performance.getMetrics');
  await cdp.detach().catch(() => {});
  const map = new Map(response.metrics.map((metric) => [metric.name, metric.value]));
  return {
    jsHeapUsedBytes: Math.round(map.get('JSHeapUsedSize') ?? 0),
    jsHeapTotalBytes: Math.round(map.get('JSHeapTotalSize') ?? 0),
    domNodes: Math.round(map.get('Nodes') ?? 0),
    documents: Math.round(map.get('Documents') ?? 0),
    layoutCount: Math.round(map.get('LayoutCount') ?? 0),
    recalcStyleCount: Math.round(map.get('RecalcStyleCount') ?? 0),
  };
}

async function pidsForPort(port) {
  try {
    const output = await execFileText('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t']);
    return output
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => Number.parseInt(value, 10))
      .filter(Number.isFinite);
  } catch {
    return [];
  }
}

async function processSampleForPorts(ports) {
  const pids = [...new Set((await Promise.all(ports.map((port) => pidsForPort(port)))).flat())];
  if (pids.length === 0) {
    return {
      pids: [],
      rssKb: 0,
      cpuPercent: 0,
      commands: [],
    };
  }

  const output = await execFileText('ps', ['-o', 'pid=', '-o', '%cpu=', '-o', 'rss=', '-o', 'command=', '-p', pids.join(',')]);
  const rows = output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.trim().match(/^(\d+)\s+([\d.]+)\s+(\d+)\s+(.+)$/);
      if (!match) {
        return undefined;
      }
      return {
        pid: Number.parseInt(match[1], 10),
        cpuPercent: Number.parseFloat(match[2]),
        rssKb: Number.parseInt(match[3], 10),
        command: match[4],
      };
    })
    .filter(Boolean);

  return {
    pids: rows.map((row) => row.pid),
    rssKb: rows.reduce((sum, row) => sum + row.rssKb, 0),
    cpuPercent: rows.reduce((sum, row) => sum + row.cpuPercent, 0),
    commands: rows.map((row) => row.command),
  };
}

function startProcessSampler(candidate) {
  const samples = [];
  let active = true;

  async function sample() {
    if (!active) {
      return;
    }
    const [sync, app] = await Promise.all([
      processSampleForPorts(candidate.syncPorts),
      processSampleForPorts(candidate.appPorts),
    ]);
    samples.push({
      atMs: performance.now(),
      sync,
      app,
    });
  }

  const interval = setInterval(() => {
    void sample();
  }, 250);
  void sample();

  return {
    async stop() {
      active = false;
      clearInterval(interval);
      await sample();

      const summarize = (role) => {
        const roleSamples = samples.map((entry) => entry[role]);
        return {
          peakRssKb: Math.max(0, ...roleSamples.map((entry) => entry.rssKb)),
          peakCpuPercent: Math.max(0, ...roleSamples.map((entry) => entry.cpuPercent)),
          pids: [...new Set(roleSamples.flatMap((entry) => entry.pids))],
          commands: [...new Set(roleSamples.flatMap((entry) => entry.commands))],
        };
      };

      return {
        sampleCount: samples.length,
        syncServer: summarize('sync'),
        appServer: summarize('app'),
      };
    },
  };
}

async function readBundleSize(candidate) {
  if (!existsSync(candidate.bundleDir)) {
    return {
      exists: false,
      rawBytes: 0,
      gzipBytes: 0,
      files: [],
    };
  }

  const names = await readdir(candidate.bundleDir);
  const files = [];
  for (const name of names) {
    if (!/\.(js|css)$/.test(name)) {
      continue;
    }
    const filePath = path.join(candidate.bundleDir, name);
    const content = await readFile(filePath);
    files.push({
      name,
      rawBytes: content.byteLength,
      gzipBytes: gzipSync(content).byteLength,
    });
  }

  return {
    exists: true,
    rawBytes: files.reduce((sum, file) => sum + file.rawBytes, 0),
    gzipBytes: files.reduce((sum, file) => sum + file.gzipBytes, 0),
    files,
  };
}

async function navigationTimings(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paintEntries = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime]),
    );
    if (!nav) {
      return {
        domContentLoadedMs: 0,
        loadEventMs: 0,
        firstContentfulPaintMs: paintEntries['first-contentful-paint'] ?? 0,
      };
    }
    return {
      domContentLoadedMs: nav.domContentLoadedEventEnd,
      loadEventMs: nav.loadEventEnd,
      firstContentfulPaintMs: paintEntries['first-contentful-paint'] ?? 0,
    };
  });
}

async function benchmarkCandidate(candidate, runIndex, browser, largeMarkdown) {
  console.log(`[perf] ${candidate.id} run ${runIndex}: main scenario`);
  const sampler = startProcessSampler(candidate);
  const documentName = makeDocumentName(candidate.id, runIndex, 'main');
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();
  const aliceNetwork = await attachNetworkMetrics(alicePage);
  const bobNetwork = await attachNetworkMetrics(bobPage);

  try {
    const aliceUrl = candidateUrl(candidate, 'alice', documentName, 'rich');
    const bobUrl = candidateUrl(candidate, 'bob', documentName, 'rich');

    const gotoStart = performance.now();
    await alicePage.goto(aliceUrl);
    const firstReadyPhases = await waitForComparableReadiness(candidate, alicePage, {
      mode: 'rich',
      startedAt: gotoStart,
    });
    const firstDebug = await readCandidateDebug(candidate, alicePage);
    const initialEditorVisibleMs = firstReadyPhases.editorVisibleMs;
    const firstComparableReadyMs = firstReadyPhases.seedVisibleMs;
    const navigation = await navigationTimings(alicePage);
    const memoryAfterSync = await getBrowserMetrics(alicePage);

    const bobGotoStart = performance.now();
    await bobPage.goto(bobUrl);
    const bobReadyPhases = await waitForComparableReadiness(candidate, bobPage, {
      mode: 'rich',
      startedAt: bobGotoStart,
    });
    const peerDebug = await readCandidateDebug(candidate, bobPage);

    const editToken = `PERF_REMOTE_${candidate.id}_${runIndex}`;
    const editStart = performance.now();
    await insertAfterAnchor(alicePage, 'Client A anchor', editToken);
    const localEditEchoMs = performance.now() - editStart;
    await waitUntil(`${candidate.id} remote edit visible`, () => richContains(bobPage, editToken));
    const remoteEditVisibleMs = performance.now() - editStart;

    const offlineToken = `PERF_OFFLINE_${candidate.id}_${runIndex}`;
    const onlineToken = `PERF_ONLINE_${candidate.id}_${runIndex}`;
    await aliceContext.setOffline(true);
    await insertAfterAnchor(alicePage, 'Local offline anchor', offlineToken);
    await insertAfterAnchor(bobPage, 'Remote online anchor', onlineToken);

    const reconnectStart = performance.now();
    await aliceContext.setOffline(false);
    await waitUntil(`${candidate.id} alice convergence`, async () => {
      return (await richContains(alicePage, offlineToken)) && (await richContains(alicePage, onlineToken));
    }, 45_000);
    await waitUntil(`${candidate.id} bob convergence`, async () => {
      return (await richContains(bobPage, offlineToken)) && (await richContains(bobPage, onlineToken));
    }, 45_000);
    const reconnectConvergenceMs = performance.now() - reconnectStart;
    const reconnectReadyPhases = {
      tokenConvergenceMs: round(reconnectConvergenceMs, 1),
    };
    const reconnectDebug = await readCandidateDebug(candidate, alicePage);
    const memoryAfterReconnect = await getBrowserMetrics(alicePage);

    const largeResult = await benchmarkLargeDocument(candidate, runIndex, browser, largeMarkdown);
    const serverProcesses = await sampler.stop();

    const network = {
      httpBytes: aliceNetwork.metrics.httpBytes + bobNetwork.metrics.httpBytes + largeResult.network.httpBytes,
      httpRequests: aliceNetwork.metrics.httpRequests + bobNetwork.metrics.httpRequests + largeResult.network.httpRequests,
      wsSentBytes: aliceNetwork.metrics.wsSentBytes + bobNetwork.metrics.wsSentBytes + largeResult.network.wsSentBytes,
      wsReceivedBytes:
        aliceNetwork.metrics.wsReceivedBytes + bobNetwork.metrics.wsReceivedBytes + largeResult.network.wsReceivedBytes,
      wsFramesSent: aliceNetwork.metrics.wsFramesSent + bobNetwork.metrics.wsFramesSent + largeResult.network.wsFramesSent,
      wsFramesReceived:
        aliceNetwork.metrics.wsFramesReceived + bobNetwork.metrics.wsFramesReceived + largeResult.network.wsFramesReceived,
    };

    return {
      runIndex,
      documentName,
      initialEditorVisibleMs,
      firstComparableReadyMs,
      navigation,
      readinessPhases: {
        first: firstReadyPhases,
        peer: bobReadyPhases,
        reconnect: reconnectReadyPhases,
      },
      debug: {
        first: firstDebug,
        peer: peerDebug,
        reconnect: reconnectDebug,
      },
      editLatency: {
        localEditEchoMs,
        remoteEditVisibleMs,
      },
      reconnectConvergenceMs,
      largeDocument: largeResult.metrics,
      memory: {
        afterFirstReady: memoryAfterSync,
        afterReconnect: memoryAfterReconnect,
        afterLargeDocument: largeResult.memoryAfterLargeDocument,
      },
      network,
      serverProcesses,
    };
  } finally {
    await Promise.all([
      aliceNetwork.detach(),
      bobNetwork.detach(),
      aliceContext.close().catch(() => {}),
      bobContext.close().catch(() => {}),
    ]);
  }
}

async function benchmarkLargeDocument(candidate, runIndex, browser, largeMarkdown) {
  console.log(`[perf] ${candidate.id} run ${runIndex}: large document scenario`);
  const documentName = makeDocumentName(candidate.id, runIndex, 'large');
  const context = await browser.newContext();
  const page = await context.newPage();
  const network = await attachNetworkMetrics(page);
  const sourceCommitToken = 'LARGE_DOC_SENTINEL';
  const largeEditToken = `PERF_LARGE_EDIT_${candidate.id}_${runIndex}`;

  try {
    const gotoStart = performance.now();
    await page.goto(candidateUrl(candidate, 'alice', documentName, 'source'));
    const sourceReadyPhases = await waitForComparableReadiness(candidate, page, {
      mode: 'source',
      startedAt: gotoStart,
    });
    const source = page.locator('[data-poc-editor-source]').first();
    await waitUntil(`${candidate.id} source visible`, () => source.isVisible().catch(() => false));

    const fillStart = performance.now();
    await source.fill(largeMarkdown);
    await waitUntil(`${candidate.id} source commit`, async () => {
      const value = await source.inputValue();
      return value.includes(sourceCommitToken);
    });
    const sourceCommitMs = performance.now() - fillStart;

    const richStart = performance.now();
    await page.getByRole('tab', { name: /rich/i }).click();
    await waitUntil(`${candidate.id} large rich render`, () => richContains(page, sourceCommitToken), 45_000);
    const richRenderAfterSourceMs = performance.now() - richStart;

    const editStart = performance.now();
    await insertAfterAnchor(page, 'Large target anchor', largeEditToken);
    const localEditEchoMs = performance.now() - editStart;
    await waitUntil(`${candidate.id} large source reflects edit`, () => sourceContains(page, largeEditToken), 45_000);
    const sourceReflectionMs = performance.now() - editStart;

    const memoryAfterLargeDocument = await getBrowserMetrics(page);
    return {
      metrics: {
        sourceReadyPhases,
        sourceCommitMs,
        richRenderAfterSourceMs,
        localEditEchoMs,
        sourceReflectionMs,
      },
      memoryAfterLargeDocument,
      network: network.metrics,
    };
  } finally {
    await Promise.all([network.detach(), context.close().catch(() => {})]);
  }
}

function median(values) {
  const sorted = values.filter(Number.isFinite).toSorted((left, right) => left - right);
  if (sorted.length === 0) {
    return 0;
  }
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function summarizeRuns(runs) {
  const pick = (selector) => round(median(runs.map(selector)));
  return {
    initialEditorVisibleMs: pick((run) => run.initialEditorVisibleMs),
    firstComparableReadyMs: pick((run) => run.firstComparableReadyMs),
    firstContentfulPaintMs: pick((run) => run.navigation.firstContentfulPaintMs),
    localEditEchoMs: pick((run) => run.editLatency.localEditEchoMs),
    remoteEditVisibleMs: pick((run) => run.editLatency.remoteEditVisibleMs),
    reconnectConvergenceMs: pick((run) => run.reconnectConvergenceMs),
    largeSourceCommitMs: pick((run) => run.largeDocument.sourceCommitMs),
    largeRichRenderAfterSourceMs: pick((run) => run.largeDocument.richRenderAfterSourceMs),
    largeLocalEditEchoMs: pick((run) => run.largeDocument.localEditEchoMs),
    largeSourceReflectionMs: pick((run) => run.largeDocument.sourceReflectionMs),
    browserHeapAfterFirstReadyMb: round(pick((run) => run.memory.afterFirstReady.jsHeapUsedBytes) / 1024 / 1024, 2),
    browserHeapAfterLargeMb: round(pick((run) => run.memory.afterLargeDocument.jsHeapUsedBytes) / 1024 / 1024, 2),
    browserDomNodesAfterLarge: Math.round(pick((run) => run.memory.afterLargeDocument.domNodes)),
    networkHttpBytes: Math.round(pick((run) => run.network.httpBytes)),
    networkWsSentBytes: Math.round(pick((run) => run.network.wsSentBytes)),
    networkWsReceivedBytes: Math.round(pick((run) => run.network.wsReceivedBytes)),
    syncServerPeakRssMb: round(pick((run) => run.serverProcesses.syncServer.peakRssKb) / 1024, 2),
    syncServerPeakCpuPercent: round(pick((run) => run.serverProcesses.syncServer.peakCpuPercent), 2),
    appServerPeakRssMb: round(pick((run) => run.serverProcesses.appServer.peakRssKb) / 1024, 2),
    appServerPeakCpuPercent: round(pick((run) => run.serverProcesses.appServer.peakCpuPercent), 2),
  };
}

function fasterCandidate(summaries, metric) {
  return summaries.toSorted((left, right) => left.summary[metric] - right.summary[metric])[0]?.id ?? 'n/a';
}

function smallerCandidate(summaries, metric) {
  return fasterCandidate(summaries, metric);
}

function formatBytes(bytes) {
  if (bytes > 1024 * 1024) {
    return `${round(bytes / 1024 / 1024, 2)} MB`;
  }
  if (bytes > 1024) {
    return `${round(bytes / 1024, 1)} KB`;
  }
  return `${bytes} B`;
}

function formatReport(result) {
  const rows = result.candidates.map((candidate) => {
    const s = candidate.summary;
    return `| ${candidate.label} | ${s.initialEditorVisibleMs} | ${s.firstComparableReadyMs} | ${s.remoteEditVisibleMs} | ${s.reconnectConvergenceMs} | ${s.largeSourceCommitMs} | ${s.largeLocalEditEchoMs} | ${s.browserHeapAfterLargeMb} | ${formatBytes(s.networkHttpBytes + s.networkWsSentBytes + s.networkWsReceivedBytes)} | ${s.syncServerPeakRssMb} |`;
  });

  const readinessRows = result.candidates.flatMap((candidate) => {
    const run = candidate.runs[0];
    const phases = run?.readinessPhases ?? {};
    return Object.entries(phases).map(([phase, values]) => {
      const rendered = Object.entries(values)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return `| ${candidate.label} | ${phase} | ${rendered || 'n/a'} |`;
    });
  });

  const summaries = result.candidates;
  return `---
title: POC-001 Collaboration Engine Browser/editor Stack Benchmark
status: measured
generated_at: ${result.generatedAt}
---

# POC-001 브라우저/에디터 Stack 성능 Benchmark

## 범위

이 benchmark는 두 POC 후보를 같은 browser automation flow로 비교한다. 측정에는 editor integration, DOM/rendering, local dev server, sync transport 비용이 포함된다. Headless CRDT-only benchmark가 아니다. Editor integration 차이는 후보 stack의 일부로 인정한다. Tiptap 후보는 Tiptap을 사용하고, Yorkie 후보는 raw ProseMirror를 사용한다. 아래 수치는 Chromium, fixed desktop viewport, local dev server, ${result.largeDocument.sectionCount} sections (${formatBytes(result.largeDocument.bytes)}) generated Markdown payload 기준 ${result.runCount}회 실행 median이다.

이 수치는 local POC 방향성 evidence이며 production capacity planning 수치가 아니다. Server process CPU/RSS는 listener port 기준 OS process tool로 sampling하므로 근사값이다.

공통 first-ready metric은 두 후보 모두 같은 gate sequence를 사용한다: ${COMPARABLE_READINESS_GATES.map((gate) => gate.id).join(' -> ')}. 후보별 transport state는 공통 transport-ready gate 판정에만 사용하고, diagnostics에 보존한다.

이 실행은 \`POC_PERF_PORT_BASE=${result.portBase ?? PORT_BASE}\`에서 파생한 포트에 fresh benchmark-local app/sync server process를 띄운다. 기존 manual-review server는 재사용하지 않는다. Benchmark port가 이미 사용 중이면 실행은 실패하고 다른 port base를 요구한다.

## 요약 표

| 후보 | 에디터 최초 표시 ms | 공통 ready gate ms | 원격 편집 반영 ms | 재연결 수렴 ms | 큰 source commit ms | 큰 문서 local edit ms | 큰 문서 이후 heap MB | network payload | sync server peak RSS MB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}

## Readiness Phase 진단

이 phase timing은 첫 번째 run에서만 capture한다. 어떤 readiness gate가 browser/editor stack timing을 지배하는지 확인하기 위한 진단 자료다.

| 후보 | phase | timings ms |
| --- | --- | --- |
${readinessRows.join('\n')}

## 1-7 비교

1. 초기 loading과 bundle 영향: ${smallerCandidate(summaries, 'initialEditorVisibleMs')} 후보가 editor surface를 더 빨리 표시했다. Bundle size는 아래 표에 있다.
2. 공통 first-ready: ${fasterCandidate(summaries, 'firstComparableReadyMs')} 후보가 같은 first-ready gate sequence를 더 빨리 통과했다.
3. 편집 latency: ${fasterCandidate(summaries, 'remoteEditVisibleMs')} 후보가 더 낮은 peer-visible edit latency를 보였다.
4. 재연결 수렴: ${fasterCandidate(summaries, 'reconnectConvergenceMs')} 후보가 한 client 재연결 후 더 빨리 수렴했다.
5. 큰 Markdown 입력 지연: ${fasterCandidate(summaries, 'largeSourceCommitMs')} 후보가 큰 source payload를 더 빨리 commit했다. 큰 문서 local edit latency는 ${fasterCandidate(summaries, 'largeLocalEditEchoMs')} 후보가 더 낮았다.
6. Browser memory: ${smallerCandidate(summaries, 'browserHeapAfterLargeMb')} 후보가 큰 문서 시나리오 이후 JS heap을 더 적게 사용했다.
7. Server process와 network payload: ${smallerCandidate(summaries, 'syncServerPeakRssMb')} 후보가 sampled sync-server RSS를 더 적게 사용했다. 측정 HTTP payload는 ${smallerCandidate(summaries, 'networkHttpBytes')} 후보가 더 적었다. Chromium CDP에서 노출되는 경우 WebSocket frame payload도 포함한다.

## Bundle Size

| 후보 | raw assets | gzip assets |
| --- | ---: | ---: |
${result.candidates
  .map((candidate) => `| ${candidate.label} | ${formatBytes(candidate.bundle.rawBytes)} | ${formatBytes(candidate.bundle.gzipBytes)} |`)
  .join('\n')}

## 상세 Median Metrics

\`\`\`json
${JSON.stringify(Object.fromEntries(result.candidates.map((candidate) => [candidate.id, candidate.summary])), null, 2)}
\`\`\`

## 주의사항

- Production deployment가 아니라 local dev server 기준이다.
- Yorkie는 isolated benchmark RPC port의 benchmark-local in-memory server로 시작한다.
- Browser memory metric은 Chromium CDP Performance metrics에서 가져오며 run 사이에 noise가 있다.
- Server CPU/RSS는 listening port 기준으로 sampling한다. Process tree와 watcher subprocess 때문에 근사값일 수 있다.
- Network payload는 HTTP encoded bytes와 Chromium CDP에 노출되는 WebSocket frame payload를 포함한다. Full packet capture가 아니다.
- Headless CRDT-only 결과와 직접 비교하지 않는다. 두 벤치는 서로 다른 계층을 측정한다.
`;
}

async function main() {
  if (!Number.isFinite(RUNS) || RUNS < 1) {
    throw new Error(`Invalid POC_PERF_RUNS: ${process.env.POC_PERF_RUNS}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const serverStarts = [];
  for (const candidate of activeCandidates) {
    serverStarts.push(await ensurePortServer({
      label: `${candidate.id} sync server`,
      port: candidate.syncPorts[0],
      command: candidate.syncCommand,
      env: candidate.syncEnv,
    }));
    for (const port of candidate.syncPorts.slice(1)) {
      await waitUntil(`${candidate.id} secondary sync port ${port}`, () => isTcpPortOpen(port), 45_000, 250);
    }
    serverStarts.push(await ensurePortServer({
      label: `${candidate.id} app server`,
      port: candidate.appPort,
      command: candidate.appCommand,
      env: candidate.appEnv,
    }));
  }

  const largeMarkdown = makeLargeMarkdown(LARGE_SECTION_COUNT);
  const browser = await chromium.launch();
  const candidateResults = [];

  try {
    for (const candidate of activeCandidates) {
      const runs = [];
      for (let runIndex = 1; runIndex <= RUNS; runIndex += 1) {
        runs.push(await benchmarkCandidate(candidate, runIndex, browser, largeMarkdown));
      }

      candidateResults.push({
        id: candidate.id,
        label: candidate.label,
        bundle: await readBundleSize(candidate),
        summary: summarizeRuns(runs),
        runs,
      });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const result = {
    generatedAt: nowIso,
    runCount: RUNS,
    serverStarts,
    largeDocument: {
      sectionCount: LARGE_SECTION_COUNT,
      bytes: Buffer.byteLength(largeMarkdown, 'utf8'),
    },
    portBase: PORT_BASE,
    candidateFilter: CANDIDATE_FILTER,
    candidates: candidateResults,
  };

  await writeFile(path.join(OUT_DIR, 'performance-results.json'), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, 'performance-report.md'), formatReport(result));
  console.log(`Wrote ${path.relative(ROOT, path.join(OUT_DIR, 'performance-report.md'))}`);
  console.log(JSON.stringify(Object.fromEntries(candidateResults.map((candidate) => [candidate.id, candidate.summary])), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => {
      for (const child of managedProcesses) {
        if (!child.killed) {
          child.kill('SIGTERM');
        }
      }
    });
}

export {
  COMPARABLE_READINESS_GATES,
  createBenchmarkCandidates,
  formatReport,
  summarizeRuns,
};
