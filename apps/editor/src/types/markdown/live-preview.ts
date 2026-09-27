import { syntaxTree } from "@codemirror/language";
import type { Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";

import { computePreviewRanges } from "./live-preview-ranges";

class RuleWidget extends WidgetType {
  toDOM(): HTMLElement {
    const rule = document.createElement("span");
    rule.className = "lp-rule";
    return rule;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    const ranges = computePreviewRanges(view.state, from, to);
    for (const line of ranges.lines) {
      decorations.push(Decoration.line({ class: line.className }).range(line.at));
    }
    for (const span of ranges.styled) {
      if (span.from < span.to) {
        decorations.push(Decoration.mark({ class: span.className }).range(span.from, span.to));
      }
    }
    for (const span of ranges.hidden) {
      if (span.from < span.to) decorations.push(Decoration.replace({}).range(span.from, span.to));
    }
    for (const span of ranges.rules) {
      decorations.push(Decoration.replace({ widget: new RuleWidget() }).range(span.from, span.to));
    }
  }
  return Decoration.set(decorations, true);
}

export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      const treeChanged = syntaxTree(update.startState) !== syntaxTree(update.state);
      if (update.docChanged || update.selectionSet || update.viewportChanged || treeChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
