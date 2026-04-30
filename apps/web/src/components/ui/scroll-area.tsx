import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type ScrollAreaProps = HTMLAttributes<HTMLDivElement>;

export function ScrollArea({ className, ...props }: ScrollAreaProps) {
  return <div className={cn("ui-scroll-area", className)} {...props} />;
}
