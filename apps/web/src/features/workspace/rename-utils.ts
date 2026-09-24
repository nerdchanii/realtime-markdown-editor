import type { KeyboardEvent } from "react";

export function handleRenameKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  onFinish: () => void,
  onCancel: () => void,
) {
  if (event.key === "Enter") {
    event.preventDefault();
    onFinish();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    onCancel();
  }
}

export function isDuplicateSiblingName(
  nextName: string,
  currentName: string,
  siblingNames: readonly string[] = [],
) {
  const normalizedNextName = nextName.trim().toLowerCase();
  const normalizedCurrentName = currentName.trim().toLowerCase();
  if (normalizedNextName === normalizedCurrentName) return false;

  return siblingNames.some((name) => name.trim().toLowerCase() === normalizedNextName);
}
