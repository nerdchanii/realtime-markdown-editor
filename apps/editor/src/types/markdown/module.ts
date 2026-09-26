import type { SyntaxNode } from "@lezer/common";
import { GFM, parser } from "@lezer/markdown";
import type * as Y from "yjs";

import { CONTENT_ROOT, type TypeModule } from "../../core/document";

// `markdown` type (ADR-0013): the Markdown string in `content` (Y.Text) is the only canonical body.

export function markdownContent(doc: Y.Doc): Y.Text {
  return doc.getText(CONTENT_ROOT);
}

const markdownParser = parser.configure(GFM);

// Syntax removed from the heading so the title reads as plain text.
const titleMarks = new Set([
  "HeaderMark",
  "EmphasisMark",
  "CodeMark",
  "StrikethroughMark",
  "LinkMark",
  "URL",
  "LinkTitle",
]);

// The title is the first top-level H1 of the body, so it has no second source of truth. Headings
// inside code blocks, quotes, or lists do not count.
export function markdownTitle(text: string): string {
  let heading = markdownParser.parse(text).topNode.firstChild;
  while (heading && heading.name !== "ATXHeading1" && heading.name !== "SetextHeading1") {
    heading = heading.nextSibling;
  }
  if (!heading) return "";
  const marks: SyntaxNode[] = [];
  collectMarks(heading, marks);
  let title = "";
  let at = heading.from;
  for (const mark of marks) {
    title += text.slice(at, mark.from);
    at = mark.to;
  }
  title += text.slice(at, heading.to);
  return title.replace(/\s+/g, " ").trim();
}

function collectMarks(node: SyntaxNode, marks: SyntaxNode[]): void {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (titleMarks.has(child.name)) marks.push(child);
    else collectMarks(child, marks);
  }
}

export const markdownType: TypeModule = {
  type: "markdown",
  schemaVersion: 1,
  toText: (doc) => markdownContent(doc).toString(),
  toMarkdown: (doc) => markdownContent(doc).toString(),
  title: (doc) => markdownTitle(markdownContent(doc).toString()),
};
