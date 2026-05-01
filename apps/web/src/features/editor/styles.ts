export const toolbarStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(180px, 1fr) auto auto",
  gap: "12px",
  alignItems: "center",
};

export const toolbarActionsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "8px",
  flexWrap: "wrap" as const,
  minWidth: 0,
};

export const toolbarGroupStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "2px",
  padding: "2px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  background: "var(--color-background)",
};

export const visuallyHiddenInputStyle = {
  position: "absolute" as const,
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap" as const,
};

export const syncStatusStyle = {
  display: "grid",
  gap: "2px",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  textAlign: "right" as const,
};

export const workspaceSinglePaneStyle = {
  display: "grid",
  gap: "12px",
  width: "min(calc(100% - 200px), 800px)",
  margin: "0 auto",
  padding: "0",
  minWidth: 0,
};

export const richEditorPaneStyle = [
  "box-sizing: border-box",
  "min-height: 100%",
  "padding: 12px 0 30vh",
  "background: var(--color-surface)",
  "color: var(--color-text-primary)",
  "font: 14px/1.55 Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "outline: none",
  "white-space: pre-wrap",
].join(";");
