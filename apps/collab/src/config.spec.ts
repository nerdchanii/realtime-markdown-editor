import { strict as assert } from "node:assert";
import { test } from "node:test";

import { readCollabRuntimeConfig } from "./config.js";

// 테스트 전용 서명 값이다.
const requiredEnv = { RME_COLLAB_TOKEN_SECRET: "rme-test-collab-token-signing-0123456789" };

test("collab runtime product defaults do not enable memory fallback", () => {
  const config = readCollabRuntimeConfig({ ...requiredEnv });

  assert.equal(config.port, 4001);
  assert.equal(config.publicRealtimeUrl, "ws://127.0.0.1:4001");
  assert.equal(config.liveYjsPersistence.provider, "api-postgres");
  assert.equal(config.enableLiveYjsPersistenceFallback, false);
});

test("collab runtime memory fallback requires explicit opt-in flag", () => {
  const config = readCollabRuntimeConfig({
    ...requiredEnv,
    RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK: "true",
  });

  assert.equal(config.enableLiveYjsPersistenceFallback, true);
});

test("collab runtime accepts dev-local COLLAB_PORT alias", () => {
  const config = readCollabRuntimeConfig({
    ...requiredEnv,
    COLLAB_PORT: "4001",
  });

  assert.equal(config.port, 4001);
  assert.equal(config.publicRealtimeUrl, "ws://127.0.0.1:4001");
});

test("collab runtime refuses to start without a strong connection token signing value", () => {
  assert.throws(() => readCollabRuntimeConfig({}), /RME_COLLAB_TOKEN_SECRET/);
  assert.throws(
    () => readCollabRuntimeConfig({ RME_COLLAB_TOKEN_SECRET: "too-short" }),
    /at least 32 characters/,
  );
});
