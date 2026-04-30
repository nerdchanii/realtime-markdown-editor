import { strict as assert } from "node:assert";
import { test } from "node:test";

import { isDevSeedRouteEnabled } from "./dev-seed-route-gate.js";

test("dev seed routes are disabled by default in production", () => {
  assert.equal(isDevSeedRouteEnabled({ NODE_ENV: "production" }), false);
});

test("dev seed routes can be explicitly enabled for bootstrap environments", () => {
  assert.equal(
    isDevSeedRouteEnabled({
      NODE_ENV: "development",
      RME_API_ENABLE_DEV_SEED_ROUTES: "true",
    }),
    true,
  );
});

test("dev seed routes cannot be enabled in production", () => {
  assert.equal(
    isDevSeedRouteEnabled({
      NODE_ENV: "production",
      RME_API_ENABLE_DEV_SEED_ROUTES: "true",
    }),
    false,
  );
});

test("dev seed routes remain available in local test and development by default", () => {
  assert.equal(isDevSeedRouteEnabled({ NODE_ENV: "test" }), true);
  assert.equal(isDevSeedRouteEnabled({ NODE_ENV: "development" }), true);
});

test("dev seed routes are disabled when the runtime environment is not explicit", () => {
  assert.equal(isDevSeedRouteEnabled({}), false);
});
