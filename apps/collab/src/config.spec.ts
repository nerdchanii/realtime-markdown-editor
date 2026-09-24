import { strict as assert } from "node:assert";
import { test } from "node:test";

import { readCollabRuntimeConfig } from "./config.js";

test("collab runtime product defaults do not enable memory fallback", () => {
  const config = readCollabRuntimeConfig({});

  assert.equal(config.port, 4001);
  assert.equal(config.publicRealtimeUrl, "ws://127.0.0.1:4001");
  assert.equal(config.liveYjsPersistence.provider, "api-postgres");
  assert.equal(config.enableLiveYjsPersistenceFallback, false);
});

test("collab runtime memory fallback requires explicit opt-in flag", () => {
  const config = readCollabRuntimeConfig({
    RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK: "true",
  });

  assert.equal(config.enableLiveYjsPersistenceFallback, true);
});

test("collab runtime accepts dev-local COLLAB_PORT alias", () => {
  const config = readCollabRuntimeConfig({
    COLLAB_PORT: "4001",
  });

  assert.equal(config.port, 4001);
  assert.equal(config.publicRealtimeUrl, "ws://127.0.0.1:4001");
});
