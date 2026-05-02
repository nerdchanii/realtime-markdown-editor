import { MoveRight } from "lucide-react";

import type { WorkspaceFolderMoveTarget } from "./types";

export function MoveNodeSelect({
  label,
  targets,
  onMove,
}: Readonly<{
  label: string;
  targets: readonly WorkspaceFolderMoveTarget[];
  onMove: (targetFolderId: string) => void;
}>) {
  return (
    <span style={moveSelectWrapStyle}>
      <MoveRight size={13} aria-hidden="true" />
      <select
        aria-label={label}
        disabled={targets.length === 0}
        value=""
        onChange={(event) => {
          const targetFolderId = event.target.value;
          if (!targetFolderId) return;
          onMove(targetFolderId);
          event.currentTarget.value = "";
        }}
        style={moveSelectStyle}
      >
        <option value="">Move</option>
        {targets.map((target) => (
          <option key={target.id} value={target.id}>
            {target.label}
          </option>
        ))}
      </select>
    </span>
  );
}

const moveSelectWrapStyle = {
  display: "inline-flex",
  width: "56px",
  height: "24px",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  gap: "2px",
  color: "#90a1b9",
};

const moveSelectStyle = {
  width: "42px",
  minWidth: 0,
  border: 0,
  background: "transparent",
  color: "#64748b",
  font: "inherit",
  fontSize: "11px",
  padding: 0,
};
