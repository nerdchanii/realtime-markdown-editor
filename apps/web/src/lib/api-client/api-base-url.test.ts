import assert from "node:assert/strict";
import test from "node:test";

import { createProductApiClient } from "./index";

test("createProductApiClient follows the current browser hostname when no env override is set", () => {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { protocol: "http:", hostname: "localhost" } },
  });

  try {
    assert.equal(createProductApiClient().baseUrl, "http://localhost:4000");
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});
