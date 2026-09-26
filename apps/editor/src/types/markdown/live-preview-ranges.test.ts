import assert from "node:assert/strict";
import { test } from "node:test";

import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState } from "@codemirror/state";

import { computePreviewRanges, type Span } from "./live-preview-ranges";

function stateAt(doc: string, cursor: number): EditorState {
  const state = EditorState.create({
    doc,
    selection: EditorSelection.cursor(cursor),
    extensions: [markdown({ base: markdownLanguage })],
  });
  ensureSyntaxTree(state, state.doc.length, 5000);
  return state;
}

const text = (state: EditorState, spans: Span[]) =>
  spans.map(({ from, to }) => state.doc.sliceString(from, to));

test("heading marks are hidden on inactive lines and shown on the cursor line", () => {
  const doc = "# Title\n\nbody";
  const away = stateAt(doc, doc.length);
  assert.deepEqual(text(away, computePreviewRanges(away).hidden), ["# "]);
  assert.deepEqual(computePreviewRanges(away).lines, [{ at: 0, className: "lp-h1" }]);

  const on = stateAt(doc, 3);
  assert.deepEqual(computePreviewRanges(on).hidden, []);
  assert.deepEqual(computePreviewRanges(on).lines, [{ at: 0, className: "lp-h1" }]);
});

test("a closing ATX run is hidden with the space before it", () => {
  const doc = "## Title ##\n\nbody";
  const away = stateAt(doc, doc.length);
  assert.deepEqual(text(away, computePreviewRanges(away).hidden), ["## ", " ##"]);
});

test("setext headings are styled and hide their underline away from the cursor", () => {
  const doc = "Title\n=====\n\nSub\n---\n\nbody";
  const away = stateAt(doc, doc.length);
  const ranges = computePreviewRanges(away);
  assert.deepEqual(text(away, ranges.hidden), ["=====", "---"]);
  assert.deepEqual(
    ranges.lines.map((l) => l.className),
    ["lp-h1", "lp-h2"],
  );

  const onUnderline = stateAt(doc, doc.indexOf("====="));
  assert.deepEqual(text(onUnderline, computePreviewRanges(onUnderline).hidden), ["---"]);
});

test("inline marks hide only away from the cursor line and keep their style", () => {
  const doc = "a **bold** and *em* and `code` and ~~gone~~\n\nnext";
  const away = stateAt(doc, doc.length);
  const ranges = computePreviewRanges(away);
  assert.deepEqual(text(away, ranges.hidden), ["**", "**", "*", "*", "`", "`", "~~", "~~"]);
  assert.deepEqual(
    ranges.styled.map((s) => s.className),
    ["lp-strong", "lp-em", "lp-code", "lp-strike"],
  );

  const on = stateAt(doc, 1);
  assert.deepEqual(computePreviewRanges(on).hidden, []);
});

test("marks of an inline node that spans lines follow their own line", () => {
  const doc = "*first\nsecond*\n\nnext";
  const onSecond = stateAt(doc, doc.indexOf("second"));
  assert.deepEqual(text(onSecond, computePreviewRanges(onSecond).hidden), ["*"]);
  assert.equal(computePreviewRanges(onSecond).hidden[0]?.from, 0);
});

test("block line styles stay inside the requested range", () => {
  const body = Array.from({ length: 50 }, (_, i) => `line ${i}`).join("\n");
  const doc = `\`\`\`\n${body}\n\`\`\`\n\nend`;
  const state = stateAt(doc, doc.length);
  const from = state.doc.line(20).from;
  const to = state.doc.line(24).to;
  const ranges = computePreviewRanges(state, from, to);
  assert.deepEqual(
    ranges.lines.map((l) => state.doc.lineAt(l.at).number),
    [20, 21, 22, 23, 24],
  );
  assert.deepEqual(ranges.hidden, []);
});

test("links show their text and hide brackets and URL away from the cursor", () => {
  const doc = "see [docs](https://example.com) here\n\nnext";
  const away = stateAt(doc, doc.length);
  const ranges = computePreviewRanges(away);
  assert.deepEqual(text(away, ranges.hidden), ["[", "]", "(", "https://example.com", ")"]);
  const link = ranges.styled.find((s) => s.className === "lp-link");
  assert.ok(link);
  assert.equal(away.doc.sliceString(link.from, link.to), "docs");
});

test("quotes, code blocks and rules get line styles", () => {
  const doc = "> quoted\n\n```js\nlet a\n```\n\n---\n\nend";
  const away = stateAt(doc, doc.length);
  const ranges = computePreviewRanges(away);
  assert.deepEqual(text(away, ranges.hidden), ["> ", "```", "js", "```"]);
  assert.deepEqual(
    ranges.lines.map((l) => l.className),
    ["lp-quote", "lp-codeblock", "lp-codeblock", "lp-codeblock"],
  );

  const onFence = stateAt(doc, doc.indexOf("```js") + 1);
  assert.deepEqual(text(onFence, computePreviewRanges(onFence).hidden), ["> ", "```"]);
  assert.deepEqual(text(away, ranges.rules), ["---"]);

  const onRule = stateAt(doc, doc.indexOf("---"));
  assert.deepEqual(computePreviewRanges(onRule).rules, []);
});
