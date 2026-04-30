export const toolbarStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(180px, 1fr) auto auto",
  gap: "12px",
  alignItems: "center",
};

export const modeGroupStyle = {
  display: "flex",
  gap: "4px",
};

export const modeButtonStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "4px",
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  padding: "6px 8px",
};

export const syncStatusStyle = {
  display: "grid",
  gap: "2px",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  textAlign: "right" as const,
};

export const workspaceGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: "12px",
  marginTop: "14px",
};

export const workspaceSinglePaneStyle = {
  display: "grid",
  gap: "12px",
  marginTop: "14px",
};

export const textareaStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  minHeight: "360px",
  resize: "vertical" as const,
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "14px",
  color: "var(--color-text-primary)",
  font: "14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export const richEditorPaneStyle = [
  "box-sizing: border-box",
  "min-height: 360px",
  "border: 1px solid var(--color-border)",
  "border-radius: 6px",
  "padding: 14px",
  "background: var(--color-surface)",
  "color: var(--color-text-primary)",
  "font: 14px/1.55 Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  "outline: none",
  "white-space: pre-wrap",
].join(";");

export const previewStyle = {
  minHeight: "330px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "14px",
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
};

export const previewHeadingStyle = {
  margin: "0 0 12px",
  fontSize: "20px",
  lineHeight: 1.35,
};

export const previewLineStyle = {
  margin: "0 0 8px",
  color: "var(--color-text-secondary)",
  fontSize: "14px",
  lineHeight: 1.55,
};

export const presenceLayerStyle = {
  position: "absolute" as const,
  inset: "76px 18px auto 18px",
  pointerEvents: "none" as const,
  zIndex: 5,
};

export function presenceRailStyle(member: { anchor?: number; head?: number }) {
  const offset = Math.max(0, Math.min(member.anchor ?? member.head ?? 0, 220));

  return {
    position: "absolute" as const,
    top: `${Math.floor(offset / 72) * 24}px`,
    left: `${12 + (offset % 72) * 5}px`,
    display: "inline-flex",
    alignItems: "center",
  };
}

export function presenceCaretStyle(color: string) {
  return {
    width: "2px",
    height: "20px",
    background: color,
    borderRadius: "2px",
    boxShadow: "0 0 0 1px var(--color-surface)",
  };
}

export function presenceSelectionStyle(member: { color: string; anchor?: number; head?: number }) {
  const length = Math.abs((member.head ?? 0) - (member.anchor ?? 0));

  return {
    position: "absolute" as const,
    left: 0,
    width: `${Math.max(0, Math.min(length * 5, 160))}px`,
    height: "20px",
    background: `${member.color}26`,
    borderRadius: "3px",
  };
}

export const presenceBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  border: "1px solid",
  borderRadius: "4px",
  padding: "4px 8px",
  marginLeft: "3px",
  background: "var(--color-surface)",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
  boxShadow: "0 1px 2px rgb(31 35 40 / 8%)",
};

export const presenceDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};
