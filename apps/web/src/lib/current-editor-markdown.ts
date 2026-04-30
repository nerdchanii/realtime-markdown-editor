let currentEditorMarkdown = "";

export function writeCurrentEditorMarkdown(markdown: string) {
  currentEditorMarkdown = markdown;
}

export function readCurrentEditorMarkdown() {
  return currentEditorMarkdown;
}
