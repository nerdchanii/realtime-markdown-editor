import { useState, type CSSProperties, type PointerEvent } from "react";

export function useWorkspaceShellLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [navigationWidth, setNavigationWidth] = useState(260);
  const [historyWidth, setHistoryWidth] = useState(320);

  const appShellStyle = {
    "--layout-sidebar-width": `${navigationWidth}px`,
    "--layout-inspector-width": `${historyWidth}px`,
  } as CSSProperties;

  return {
    appShellStyle,
    historyWidth,
    isHistoryOpen,
    isNavigationOpen,
    navigationWidth,
    resizeHistory: (delta: number) =>
      setHistoryWidth((current) => clampPanelWidth(current - delta, 220, 520)),
    resizeNavigation: (delta: number) =>
      setNavigationWidth((current) => clampPanelWidth(current + delta, 180, 420)),
    setHistoryWidth,
    setNavigationWidth,
    toggleHistory: () => setIsHistoryOpen((current) => !current),
    toggleNavigation: () => setIsNavigationOpen((current) => !current),
  };
}

export function PanelResizeHandle({
  ariaLabel,
  edge,
  offset,
  onKeyStep,
  onResizeStart,
}: Readonly<{
  ariaLabel: string;
  edge: "left" | "right";
  offset: number;
  onKeyStep: (delta: number) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}>) {
  return (
    // The resize separator is intentionally pointer- and keyboard-draggable.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      aria-label={ariaLabel}
      className={`panel-resize-handle panel-resize-handle--${edge}`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onKeyStep(-16);
        if (event.key === "ArrowRight") onKeyStep(16);
      }}
      onPointerDown={onResizeStart}
      role="separator"
      style={edge === "left" ? { left: `${offset}px` } : { right: `${offset}px` }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    />
  );
}

export function startPanelResize(
  event: PointerEvent<HTMLElement>,
  input: Readonly<{
    min: number;
    max: number;
    side: "left" | "right";
    onResize: (width: number) => void;
  }>,
) {
  event.preventDefault();

  const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
    const nextWidth =
      input.side === "left" ? moveEvent.clientX : window.innerWidth - moveEvent.clientX;
    input.onResize(clampPanelWidth(nextWidth, input.min, input.max));
  };

  const handlePointerUp = () => {
    document.body.classList.remove("is-resizing-panel");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  document.body.classList.add("is-resizing-panel");
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp, { once: true });
}

function clampPanelWidth(width: number, min: number, max: number) {
  return Math.min(Math.max(width, min), max);
}
