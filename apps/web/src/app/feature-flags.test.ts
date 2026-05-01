import assert from "node:assert/strict";
import test from "node:test";

import { isDirectMessagesEnabled } from "./feature-flags";

test("isDirectMessagesEnabled defaults to false when the feature flag is absent", () => {
  assert.equal(isDirectMessagesEnabled(), false);
});
