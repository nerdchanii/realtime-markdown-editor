import { panelStyles } from "./styles";

export function documentButtonStyle(isSelected: boolean) {
  return {
    ...panelStyles.nodeButton,
    flex: 1,
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

export function folderRowStyle(isSelected: boolean, isDropTarget: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: "4px",
    outline: isDropTarget ? "1px solid var(--color-accent)" : "1px solid transparent",
    background: isDropTarget ? "#dbeafe" : isSelected ? "#eff6ff" : "transparent",
    color: isDropTarget || isSelected ? "#1447e6" : "#45556c",
  };
}

export function documentRowStyle(isSelected: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: "4px",
    background: isSelected ? "#eff6ff" : "transparent",
    color: isSelected ? "#1447e6" : "#45556c",
  };
}

export const folderToggleStyle = {
  display: "inline-flex",
  width: "22px",
  height: "28px",
  flex: "0 0 auto",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  background: "transparent",
  cursor: "pointer",
  padding: 0,
};

export const folderSelectStyle = {
  ...panelStyles.nodeButton,
  flex: 1,
  padding: "6px 6px 6px 0px",
  gap: "4px",
  background: "transparent",
};

export const folderRenameWrapStyle = {
  ...panelStyles.nodeButton,
  flex: 1,
  padding: "6px 6px 6px 0px",
  gap: "4px",
  background: "transparent",
};

export const folderRenameInputStyle = {
  minWidth: 0,
  flex: 1,
  border: "0",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  outline: "0",
  padding: 0,
};
