import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils.js";

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;
export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger>;
export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;
export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;
export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export function Select(props: SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger className={cn("ui-select-trigger", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={12} aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue(props: SelectValueProps) {
  return <SelectPrimitive.Value {...props} />;
}

export function SelectContent({ className, position = "popper", ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn("ui-select-content", className)}
        position={position}
        {...props}
      />
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item className={cn("ui-select-item", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ui-select-item-indicator">
        <Check size={12} aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
