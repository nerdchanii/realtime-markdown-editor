import { Trash2 } from "lucide-react";

export function DeleteNodeButton({
  label,
  message,
  onDelete,
}: Readonly<{
  label: string;
  message: string;
  onDelete: () => void;
}>) {
  return (
    <button
      type="button"
      className="workspace-node-delete"
      style={nodeDeleteStyle}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        if (!confirmDelete(message)) return;
        onDelete();
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}

function confirmDelete(message: string): boolean {
  if (typeof globalThis.confirm !== "function") return true;
  return globalThis.confirm(message);
}

const nodeDeleteStyle = {
  display: "inline-flex",
  width: "22px",
  height: "22px",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: "4px",
  background: "transparent",
  color: "#90a1b9",
  cursor: "pointer",
  padding: 0,
};
