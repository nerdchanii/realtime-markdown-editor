import type { RefObject } from "react";
import { useEffect, useState } from "react";

type ScrollTarget = RefObject<HTMLElement> | Window | null | undefined;
type EventTargetWithScroll = Window | HTMLElement | Document;

interface UseScrollingOptions {
  debounce?: number;
  fallbackToDocument?: boolean;
}

export function useScrolling(target?: ScrollTarget, options: UseScrollingOptions = {}): boolean {
  const { debounce = 150, fallbackToDocument = true } = options;
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const element = resolveScrollElement(target);
    const eventTarget = resolveScrollEventTarget(element, fallbackToDocument);
    let timeout: ReturnType<typeof setTimeout>;
    const supportsScrollEnd = element === window && "onscrollend" in window;

    const handleScroll: EventListener = () => {
      setIsScrolling(true);
      if (!supportsScrollEnd) {
        clearTimeout(timeout);
        timeout = setTimeout(() => setIsScrolling(false), debounce);
      }
    };

    const handleScrollEnd: EventListener = () => setIsScrolling(false);

    addScrollListeners(eventTarget, supportsScrollEnd, handleScroll, handleScrollEnd);

    return () => {
      removeScrollListeners(eventTarget, supportsScrollEnd, handleScroll, handleScrollEnd);
      clearTimeout(timeout);
    };
  }, [target, debounce, fallbackToDocument]);

  return isScrolling;
}

function resolveScrollElement(target: ScrollTarget): EventTargetWithScroll {
  if (target && typeof Window !== "undefined" && target instanceof Window) return target;
  return (target as RefObject<HTMLElement>)?.current ?? window;
}

function resolveScrollEventTarget(
  element: EventTargetWithScroll,
  fallbackToDocument: boolean,
): EventTargetWithScroll {
  if (fallbackToDocument && element === window && typeof document !== "undefined") return document;
  return element;
}

function addScrollListeners(
  eventTarget: EventTargetWithScroll,
  supportsScrollEnd: boolean,
  handleScroll: EventListener,
  handleScrollEnd: EventListener,
) {
  eventTarget.addEventListener("scroll", handleScroll, true);
  if (supportsScrollEnd) eventTarget.addEventListener("scrollend", handleScrollEnd, true);
}

function removeScrollListeners(
  eventTarget: EventTargetWithScroll,
  supportsScrollEnd: boolean,
  handleScroll: EventListener,
  handleScrollEnd: EventListener,
) {
  eventTarget.removeEventListener("scroll", handleScroll);
  if (supportsScrollEnd) eventTarget.removeEventListener("scrollend", handleScrollEnd);
}
