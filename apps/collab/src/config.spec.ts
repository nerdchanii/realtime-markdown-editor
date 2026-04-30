import { strict as assert } from "node:assert";
import { test } from "node:test";

import { readCollabRuntimeConfig } from "./config.js";

test("collab runtime product defaults do not enable seed or memory fallbacks", () => {
  const config = readCollabRuntimeConfig({});

  assert.equal(config.liveYjsPersistence.provider, "api-postgres");
  assert.equal(config.enableSeedSessionFallback, false);
  assert.equal(config.enableLiveYjsPersistenceFallback, false);
});

test("collab runtime dev fallbacks require explicit opt-in flags", () => {
  const config = readCollabRuntimeConfig({
    RME_COLLAB_ENABLE_SEED_SESSION_FALLBACK: "true",
    RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK: "true",
  });

  assert.equal(config.enableSeedSessionFallback, true);
  assert.equal(config.enableLiveYjsPersistenceFallback, true);
});
