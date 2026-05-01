import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";

type Orientation = "horizontal" | "vertical" | "both";

interface MenuNavigationOptions<T> {
  /**
   * The Tiptap editor instance, if using with a Tiptap editor.
   */
  editor?: Editor | null | undefined;
  /**
   * Reference to the container element for handling keyboard events.
   */
  containerRef?: React.RefObject<HTMLElement | null> | undefined;
  /**
   * Search query that affects the selected item.
   */
  query?: string | undefined;
  /**
   * Array of items to navigate through.
   */
  items: T[];
  /**
   * Callback fired when an item is selected.
   */
  onSelect?: ((item: T) => void) | undefined;
  /**
   * Callback fired when the menu should close.
   */
  onClose?: (() => void) | undefined;
  /**
   * The navigation orientation of the menu.
   * @default "vertical"
   */
  orientation?: Orientation | undefined;
  /**
   * Whether to automatically select the first item when the menu opens.
   * @default true
   */
  autoSelectFirstItem?: boolean;
}

type NavigationState = Readonly<{
  query: string | undefined;
  selectedIndex: number;
}>;

type SetSelectedIndex = (value: number | ((currentIndex: number) => number)) => void;
type KeyboardNavigationOptions<T> = Omit<MenuNavigationOptions<T>, "orientation"> &
  Readonly<{ orientation: Orientation; selectedIndex: number; setSelectedIndex: SetSelectedIndex }>;

/**
 * Hook that implements keyboard navigation for dropdown menus and command palettes.
 *
 * Handles arrow keys, tab, home/end, enter for selection, and escape to close.
 * Works with both Tiptap editors and regular DOM elements.
 *
 * @param options - Configuration options for the menu navigation
 * @returns Object containing the selected index and a setter function
 */
export function useMenuNavigation<T>({
  editor,
  containerRef,
  query,
  items,
  onSelect,
  onClose,
  orientation = "vertical",
  autoSelectFirstItem = true,
}: MenuNavigationOptions<T>) {
  const initialIndex = autoSelectFirstItem ? 0 : -1;
  const [navigation, setNavigation] = useState<NavigationState>({
    query,
    selectedIndex: initialIndex,
  });
  const selectedIndex = navigation.query === query ? navigation.selectedIndex : initialIndex;
  const setSelectedIndex = useCallback<SetSelectedIndex>(
    (value) => {
      setNavigation((current) => {
        const currentIndex = current.query === query ? current.selectedIndex : initialIndex;
        const selectedIndex = typeof value === "function" ? value(currentIndex) : value;
        return { query, selectedIndex };
      });
    },
    [initialIndex, query],
  );

  useKeyboardNavigation({
    containerRef,
    editor,
    items,
    onClose,
    onSelect,
    orientation,
    selectedIndex,
    setSelectedIndex,
  });

  return { selectedIndex: items.length ? selectedIndex : undefined, setSelectedIndex };
}

function useKeyboardNavigation<T>({
  containerRef,
  editor,
  items,
  onClose,
  onSelect,
  orientation,
  selectedIndex,
  setSelectedIndex,
}: KeyboardNavigationOptions<T>) {
  useEffect(() => {
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      return handleMenuKeyDown(event, {
        items,
        onClose,
        onSelect,
        orientation,
        selectedIndex,
        setSelectedIndex,
      });
    };
    const targetElement = getNavigationTarget(editor, containerRef);

    if (targetElement) {
      targetElement.addEventListener("keydown", handleKeyboardNavigation, true);

      return () => {
        targetElement?.removeEventListener("keydown", handleKeyboardNavigation, true);
      };
    }

    return undefined;
  }, [
    editor,
    containerRef,
    items,
    selectedIndex,
    onSelect,
    onClose,
    orientation,
    setSelectedIndex,
  ]);
}

function handleMenuKeyDown<T>(
  event: KeyboardEvent,
  input: Readonly<{
    items: T[];
    onClose?: (() => void) | undefined;
    onSelect?: ((item: T) => void) | undefined;
    orientation: Orientation;
    selectedIndex: number;
    setSelectedIndex: SetSelectedIndex;
  }>,
) {
  if (!input.items.length) return false;
  if (handleMovementKey(event, input)) return true;
  if (handleBoundaryKey(event, input)) return true;
  return handleActionKey(event, input);
}

function handleMovementKey<T>(
  event: KeyboardEvent,
  input: Readonly<{ items: T[]; orientation: Orientation; setSelectedIndex: SetSelectedIndex }>,
) {
  const moveNext = () => input.setSelectedIndex((index) => nextIndex(index, input.items.length));
  const movePrev = () =>
    input.setSelectedIndex((index) => previousIndex(index, input.items.length));
  const action = getMovementAction(event, input.orientation, moveNext, movePrev);

  return action ? preventAndRun(event, action) : false;
}

function getMovementAction(
  event: KeyboardEvent,
  orientation: Orientation,
  moveNext: () => void,
  movePrev: () => void,
) {
  if (event.key === "Tab") return event.shiftKey ? movePrev : moveNext;
  const movement = arrowMovements(moveNext, movePrev)[event.key];
  if (!movement || movement.blockedOrientation === orientation) return null;
  return movement.action;
}

function arrowMovements(moveNext: () => void, movePrev: () => void) {
  return {
    ArrowUp: { action: movePrev, blockedOrientation: "horizontal" },
    ArrowDown: { action: moveNext, blockedOrientation: "horizontal" },
    ArrowLeft: { action: movePrev, blockedOrientation: "vertical" },
    ArrowRight: { action: moveNext, blockedOrientation: "vertical" },
  } as Record<string, { action: () => void; blockedOrientation: Orientation }>;
}

function handleBoundaryKey<T>(
  event: KeyboardEvent,
  input: Readonly<{ items: T[]; setSelectedIndex: SetSelectedIndex }>,
) {
  if (event.key === "Home") return preventAndRun(event, () => input.setSelectedIndex(0));
  if (event.key === "End")
    return preventAndRun(event, () => input.setSelectedIndex(input.items.length - 1));
  return false;
}

function handleActionKey<T>(
  event: KeyboardEvent,
  input: Readonly<{
    items: T[];
    onClose?: (() => void) | undefined;
    onSelect?: ((item: T) => void) | undefined;
    selectedIndex: number;
  }>,
) {
  if (event.key === "Enter") return handleEnterKey(event, input);
  if (event.key === "Escape") return preventAndRun(event, () => input.onClose?.());
  return false;
}

function handleEnterKey<T>(
  event: KeyboardEvent,
  input: Readonly<{
    items: T[];
    onSelect?: ((item: T) => void) | undefined;
    selectedIndex: number;
  }>,
) {
  if (event.isComposing) return false;
  return preventAndRun(event, () => {
    const item = input.items[input.selectedIndex];
    if (input.selectedIndex !== -1 && item !== undefined) {
      input.onSelect?.(item);
    }
  });
}

function getNavigationTarget(
  editor: Editor | null | undefined,
  containerRef: React.RefObject<HTMLElement | null> | undefined,
) {
  return editor?.view.dom ?? containerRef?.current ?? null;
}

function nextIndex(currentIndex: number, itemCount: number) {
  if (currentIndex === -1) return 0;
  return (currentIndex + 1) % itemCount;
}

function previousIndex(currentIndex: number, itemCount: number) {
  if (currentIndex === -1) return itemCount - 1;
  return (currentIndex - 1 + itemCount) % itemCount;
}

function preventAndRun(event: KeyboardEvent, action: () => void) {
  event.preventDefault();
  action();
  return true;
}
