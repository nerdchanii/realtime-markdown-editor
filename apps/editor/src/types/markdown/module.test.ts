import assert from "node:assert/strict";
import { test } from "node:test";

import { markdownTitle } from "./module";

test("the title is the first H1 without its syntax marks", () => {
  assert.equal(
    markdownTitle("intro\n\n# **Weekly** `sync` [notes](https://x.y)\n\n# Later"),
    "Weekly sync notes",
  );
  assert.equal(markdownTitle("# Closed heading ##"), "Closed heading");
  assert.equal(markdownTitle("Setext title\n===\n\nbody"), "Setext title");
});

test("only top-level H1 counts", () => {
  assert.equal(
    markdownTitle("```\n# not a title\n```\n\n## Section\n\n> # quoted\n\n- # listed"),
    "",
  );
  assert.equal(markdownTitle("```\n# not a title\n```\n\n# Real"), "Real");
});

test("an empty heading or body has no title", () => {
  assert.equal(markdownTitle(""), "");
  assert.equal(markdownTitle("#"), "");
  assert.equal(markdownTitle("#hashtag"), "");
});
