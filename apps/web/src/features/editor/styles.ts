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
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "8px",
  marginTop: "12px",
};

export const presenceBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  border: "1px solid",
  borderRadius: "999px",
  padding: "4px 8px",
  color: "var(--color-text-secondary)",
  fontSize: "12px",
};

export const presenceDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};
