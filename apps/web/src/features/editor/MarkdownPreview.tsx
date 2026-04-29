import { previewHeadingStyle, previewLineStyle, previewStyle } from "./styles";

type PreviewRow =
  | Readonly<{ kind: "heading"; key: string; text: string }>
  | Readonly<{ kind: "list"; key: string; text: string }>
  | Readonly<{ kind: "quote"; key: string; text: string }>
  | Readonly<{ kind: "task"; key: string; text: string; checked: boolean }>
  | Readonly<{ kind: "paragraph"; key: string; text: string }>
  | Readonly<{ kind: "code"; key: string; text: string }>
  | Readonly<{ kind: "table"; key: string; headers: readonly string[]; rows: readonly string[][] }>;

type PreviewRowWithoutKey =
  | Readonly<{ kind: "heading"; text: string }>
  | Readonly<{ kind: "list"; text: string }>
  | Readonly<{ kind: "quote"; text: string }>
  | Readonly<{ kind: "task"; text: string; checked: boolean }>
  | Readonly<{ kind: "paragraph"; text: string }>
  | Readonly<{ kind: "code"; text: string }>
  | Readonly<{ kind: "table"; headers: readonly string[]; rows: readonly string[][] }>;

export function MarkdownPreview({ markdown }: Readonly<{ markdown: string }>) {
  return (
    <section aria-label="Rich preview" data-testid="markdown-rich-preview" style={previewStyle}>
      {createPreviewRows(markdown).map((row) => (
        <PreviewLine key={row.key} row={row} />
      ))}
    </section>
  );
}

function createPreviewRows(markdown: string): readonly PreviewRow[] {
  const occurrences = new Map<string, number>();
  const rows: PreviewRow[] = [];
  const lines = markdown.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      continue;
    }

    const block = readBlock(lines, index);
    if (block) {
      appendRow(rows, block.row, occurrences);
      index = block.endIndex;
      continue;
    }

    appendRow(rows, createPreviewRow(line), occurrences);
  }

  return rows;
}

function readBlock(lines: readonly string[], startIndex: number) {
  const line = lines[startIndex]?.trim() ?? "";

  if (line.startsWith("```")) {
    return readCodeBlock(lines, startIndex);
  }

  if (isTableStart(lines, startIndex)) {
    return readTable(lines, startIndex);
  }

  return undefined;
}

function readCodeBlock(lines: readonly string[], startIndex: number) {
  const codeLines: string[] = [];
  let endIndex = startIndex;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    endIndex = index;
    if (lines[index]?.trim().startsWith("```")) {
      break;
    }
    codeLines.push(lines[index] ?? "");
  }

  return { row: { kind: "code" as const, text: codeLines.join("\n") }, endIndex };
}

function readTable(lines: readonly string[], startIndex: number) {
  const headers = splitTableRow(lines[startIndex] ?? "");
  const rows: string[][] = [];
  let endIndex = startIndex + 1;

  for (let index = startIndex + 2; index < lines.length; index += 1) {
    if (!isTableRow(lines[index] ?? "")) {
      break;
    }
    rows.push(splitTableRow(lines[index] ?? ""));
    endIndex = index;
  }

  return { row: { kind: "table" as const, headers, rows }, endIndex };
}

function createPreviewRow(line: string): PreviewRowWithoutKey {
  if (line.startsWith("# ")) {
    return { kind: "heading", text: line.slice(2) };
  }

  const task = /^-\s+\[(?<checked>[ xX])\]\s+(?<text>.+)$/.exec(line);
  if (isTaskMatch(task)) {
    return { kind: "task", text: task.groups.text, checked: task.groups.checked !== " " };
  }

  if (line.startsWith("- ")) {
    return { kind: "list", text: line.slice(2) };
  }

  if (line.startsWith("> ")) {
    return { kind: "quote", text: line.slice(2) };
  }

  return { kind: "paragraph", text: line };
}

function isTaskMatch(
  task: RegExpExecArray | null,
): task is RegExpExecArray & { groups: { checked: string; text: string } } {
  return typeof task?.groups?.checked === "string" && typeof task.groups.text === "string";
}

function appendRow(
  rows: PreviewRow[],
  row: PreviewRowWithoutKey,
  occurrences: Map<string, number>,
) {
  const keyedRow = addKey(row, occurrences);
  if (keyedRow) rows.push(keyedRow);
}

function addKey(row: PreviewRowWithoutKey, occurrences: Map<string, number>): PreviewRow | null {
  const contentKey = JSON.stringify(row);
  const occurrence = occurrences.get(contentKey);
  occurrences.set(contentKey, (occurrence ?? 0) + 1);

  if (occurrence !== undefined) return null;

  return { ...row, key: contentKey } as PreviewRow;
}

function PreviewLine({ row }: Readonly<{ row: PreviewRow }>) {
  if (row.kind === "heading") {
    return <h3 style={previewHeadingStyle}>{row.text}</h3>;
  }

  if (row.kind === "code") {
    return <PreviewCode text={row.text} />;
  }

  if (row.kind === "table") {
    return <PreviewTable row={row} />;
  }

  return <PreviewTextRow row={row} />;
}

function PreviewCode({ text }: Readonly<{ text: string }>) {
  return (
    <pre style={previewLineStyle}>
      <code>{text}</code>
    </pre>
  );
}

function PreviewTextRow({
  row,
}: Readonly<{ row: Exclude<PreviewRow, { kind: "heading" | "code" | "table" }> }>) {
  if (row.kind === "list") return <PreviewList text={row.text} />;
  if (row.kind === "quote") return <PreviewQuote text={row.text} />;
  if (row.kind === "task") return <PreviewTask text={row.text} checked={row.checked} />;

  return <PreviewParagraph text={row.text} />;
}

function PreviewList({ text }: Readonly<{ text: string }>) {
  return (
    <ul style={previewLineStyle}>
      <li>
        <InlineMarkdown text={text} />
      </li>
    </ul>
  );
}

function PreviewQuote({ text }: Readonly<{ text: string }>) {
  return (
    <blockquote style={previewLineStyle}>
      <InlineMarkdown text={text} />
    </blockquote>
  );
}

function PreviewTask({ text, checked }: Readonly<{ text: string; checked: boolean }>) {
  return (
    <label style={previewLineStyle}>
      <input type="checkbox" checked={checked} readOnly />
      <InlineMarkdown text={text} />
    </label>
  );
}

function PreviewParagraph({ text }: Readonly<{ text: string }>) {
  return (
    <p style={previewLineStyle}>
      <InlineMarkdown text={text} />
    </p>
  );
}

function PreviewTable({ row }: Readonly<{ row: Extract<PreviewRow, { kind: "table" }> }>) {
  return (
    <table style={previewLineStyle}>
      <thead>
        <tr>
          {row.headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {row.rows.map((cells) => (
          <tr key={cells.join("|")}>
            {cells.map((cell) => (
              <td key={cell}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InlineMarkdown({ text }: Readonly<{ text: string }>) {
  const link = /\[(?<label>[^\]]+)\]\((?<href>[^)\s]+)\)/.exec(text);

  if (link?.groups) {
    const before = text.slice(0, link.index);
    const after = text.slice(link.index + link[0].length);

    return (
      <>
        {before}
        <a href={link.groups.href}>{link.groups.label}</a>
        {after}
      </>
    );
  }

  if (text.startsWith("`") && text.endsWith("`") && text.length > 1) {
    return <code>{text.slice(1, -1)}</code>;
  }

  return text;
}

function isTableStart(lines: readonly string[], index: number) {
  return isTableRow(lines[index] ?? "") && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(lines[index + 1] ?? "");
}

function isTableRow(line: string) {
  return line.includes("|");
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}
