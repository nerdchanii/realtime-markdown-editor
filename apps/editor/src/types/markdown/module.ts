import type * as Y from "yjs";

import { CONTENT_ROOT, type TypeModule } from "../../core/document";

// `markdown` type (ADR-0013): the Markdown string in `content` (Y.Text) is the only canonical body.

export function markdownContent(doc: Y.Doc): Y.Text {
  return doc.getText(CONTENT_ROOT);
}

export const markdownType: TypeModule = {
  type: "markdown",
  schemaVersion: 1,
  toText: (doc) => markdownContent(doc).toString(),
  toMarkdown: (doc) => markdownContent(doc).toString(),
};
