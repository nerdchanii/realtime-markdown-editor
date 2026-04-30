import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  role,
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-orientation={orientation}
      className={cn("ui-separator", `ui-separator--${orientation}`, className)}
      role={role ?? "separator"}
      {...props}
    />
  );
}
