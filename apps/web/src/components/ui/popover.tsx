import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils.js";

export type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;
export type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;
export type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;

export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger {...props} />;
}

export function PopoverContent({ className, sideOffset = 6, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn("ui-popover-content", className)}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
