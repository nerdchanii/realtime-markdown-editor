import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import type { SyntaxNodeRef } from "@lezer/common";

// Obsidian-style live preview (ADR-0013): formatting renders inline and Markdown syntax is
// visible only on lines that hold the cursor or selection. This module computes plain ranges from
// the syntax tree so the rules can be tested without a DOM; live-preview.ts turns them into
// CodeMirror decorations.

export interface Span {
  from: number;
  to: number;
}

export interface StyledSpan extends Span {
  className: string;
}

export interface LineStyle {
  at: number; // position of the line start
  className: string;
}

export interface PreviewRanges {
  hidden: Span[];
  styled: StyledSpan[];
  lines: LineStyle[];
  rules: Span[]; // horizontal rules rendered as a divider
}

const inlineStyles: Record<string, string> = {
  StrongEmphasis: "lp-strong",
  Emphasis: "lp-em",
  Strikethrough: "lp-strike",
  InlineCode: "lp-code",
};

// Syntax marks hidden on inactive lines, keyed by the parent node that owns them.
const hiddenMarks: Record<string, string[]> = {
  StrongEmphasis: ["EmphasisMark"],
  Emphasis: ["EmphasisMark"],
  Strikethrough: ["StrikethroughMark"],
  InlineCode: ["CodeMark"],
  Link: ["LinkMark", "URL", "LinkTitle"],
};

function activeLines(state: EditorState): Set<number> {
  const lines = new Set<number>();
  for (const range of state.selection.ranges) {
    const first = state.doc.lineAt(range.from).number;
    const last = state.doc.lineAt(range.to).number;
    for (let line = first; line <= last; line++) lines.add(line);
  }
  return lines;
}

function lineStarts(state: EditorState, from: number, to: number): number[] {
  const starts: number[] = [];
  for (let pos = from; pos <= to; ) {
    const line = state.doc.lineAt(pos);
    starts.push(line.from);
    pos = line.to + 1;
  }
  return starts;
}

// A leading mark (`#`, `>`) also hides the single space that follows it.
function withTrailingSpace(state: EditorState, span: Span): Span {
  const next = state.doc.sliceString(span.to, span.to + 1);
  return next === " " ? { from: span.from, to: span.to + 1 } : span;
}

function childSpans(node: SyntaxNodeRef, names: string[]): Span[] {
  const spans: Span[] = [];
  const cursor = node.node.cursor();
  if (!cursor.firstChild()) return spans;
  do {
    if (names.includes(cursor.name)) spans.push({ from: cursor.from, to: cursor.to });
  } while (cursor.nextSibling());
  return spans;
}

export function computePreviewRanges(
  state: EditorState,
  from = 0,
  to = state.doc.length,
): PreviewRanges {
  const result: PreviewRanges = { hidden: [], styled: [], lines: [], rules: [] };
  const active = activeLines(state);
  const isActive = (pos: number) => active.has(state.doc.lineAt(pos).number);

  syntaxTree(state).iterate({
    from,
    to,
    enter(node) {
      const heading = /^ATXHeading([1-6])$/.exec(node.name);
      if (heading) {
        result.lines.push({ at: state.doc.lineAt(node.from).from, className: `lp-h${heading[1]}` });
        if (!isActive(node.from)) {
          for (const mark of childSpans(node, ["HeaderMark"]).slice(0, 1)) {
            result.hidden.push(withTrailingSpace(state, mark));
          }
        }
        return;
      }
      if (node.name === "Blockquote") {
        for (const at of lineStarts(state, node.from, node.to)) {
          result.lines.push({ at, className: "lp-quote" });
        }
        return;
      }
      if (node.name === "QuoteMark" && !isActive(node.from)) {
        result.hidden.push(withTrailingSpace(state, { from: node.from, to: node.to }));
        return;
      }
      if (node.name === "FencedCode") {
        for (const at of lineStarts(state, node.from, node.to)) {
          result.lines.push({ at, className: "lp-codeblock" });
        }
        return false;
      }
      if (node.name === "HorizontalRule") {
        if (!isActive(node.from)) result.rules.push({ from: node.from, to: node.to });
        return;
      }
      if (node.name === "ListMark") {
        result.styled.push({ from: node.from, to: node.to, className: "lp-listmark" });
        return;
      }
      const style = inlineStyles[node.name];
      if (style) result.styled.push({ from: node.from, to: node.to, className: style });
      if (node.name === "Link") {
        const text = childSpans(node, ["LinkMark"]);
        const [open, close] = text;
        if (open && close)
          result.styled.push({ from: open.to, to: close.from, className: "lp-link" });
      }
      const marks = hiddenMarks[node.name];
      if (marks && !isActive(node.from)) result.hidden.push(...childSpans(node, marks));
      return;
    },
  });

  return result;
}
