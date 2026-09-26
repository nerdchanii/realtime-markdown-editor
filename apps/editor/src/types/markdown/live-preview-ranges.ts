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

function withLeadingSpace(state: EditorState, span: Span): Span {
  const prev = state.doc.sliceString(span.from - 1, span.from);
  return prev === " " ? { from: span.from - 1, to: span.to } : span;
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

// Shared by the per-node helpers. `from`/`to` is the range being decorated (usually a viewport).
interface Pass {
  state: EditorState;
  from: number;
  to: number;
  isActive: (pos: number) => boolean;
  result: PreviewRanges;
}

// Line starts of a block, clipped to the pass range so a large block costs only what is visible.
function blockLineStarts({ state, from, to }: Pass, node: SyntaxNodeRef): number[] {
  return lineStarts(state, Math.max(node.from, from), Math.min(node.to, to));
}

function addHeading({ state, isActive, result }: Pass, node: SyntaxNodeRef): void {
  const level = node.name.slice(-1);
  result.lines.push({ at: state.doc.lineAt(node.from).from, className: `lp-h${level}` });
  const [first, ...rest] = childSpans(node, ["HeaderMark"]);
  if (!first || isActive(first.from)) return;
  if (node.name.startsWith("ATX")) {
    // Leading `#` run with its space, and an optional closing run with the space before it.
    result.hidden.push(withTrailingSpace(state, first));
    for (const mark of rest) result.hidden.push(withLeadingSpace(state, mark));
  } else {
    // Setext underline (`===` / `---`) on its own line.
    result.hidden.push(first);
  }
}

function addFencedCode(pass: Pass, node: SyntaxNodeRef): void {
  const { from, to, isActive, result } = pass;
  for (const at of blockLineStarts(pass, node)) {
    result.lines.push({ at, className: "lp-codeblock" });
  }
  // Fences and the language tag show only on the line that holds the cursor.
  for (const mark of childSpans(node, ["CodeMark", "CodeInfo"])) {
    if (mark.to >= from && mark.from <= to && !isActive(mark.from)) result.hidden.push(mark);
  }
}

export function computePreviewRanges(
  state: EditorState,
  from = 0,
  to = state.doc.length,
): PreviewRanges {
  const result: PreviewRanges = { hidden: [], styled: [], lines: [], rules: [] };
  const active = activeLines(state);
  const isActive = (pos: number) => active.has(state.doc.lineAt(pos).number);
  const pass: Pass = { state, from, to, isActive, result };

  syntaxTree(state).iterate({
    from,
    to,
    enter(node) {
      if (/^(ATX|Setext)Heading[1-6]$/.test(node.name)) {
        addHeading(pass, node);
        return;
      }
      if (node.name === "Blockquote") {
        for (const at of blockLineStarts(pass, node)) {
          result.lines.push({ at, className: "lp-quote" });
        }
        return;
      }
      if (node.name === "QuoteMark" && !isActive(node.from)) {
        result.hidden.push(withTrailingSpace(state, { from: node.from, to: node.to }));
        return;
      }
      if (node.name === "FencedCode") {
        addFencedCode(pass, node);
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
      // Each mark follows its own line: inline nodes can span lines.
      if (marks) result.hidden.push(...childSpans(node, marks).filter((m) => !isActive(m.from)));
      return;
    },
  });

  return result;
}
