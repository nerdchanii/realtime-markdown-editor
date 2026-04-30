import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type TabsProps = HTMLAttributes<HTMLDivElement>;
export type TabsListProps = HTMLAttributes<HTMLDivElement>;
export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};
export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
};

export function Tabs({ className, ...props }: TabsProps) {
  return <div className={cn("ui-tabs", className)} {...props} />;
}

export function TabsList({ className, ...props }: TabsListProps) {
  return <div className={cn("ui-tabs-list", className)} role="tablist" {...props} />;
}

export function TabsTrigger({
  active = false,
  className,
  type = "button",
  ...props
}: TabsTriggerProps) {
  return (
    <button
      aria-selected={active}
      className={cn("ui-tabs-trigger", { "is-active": active }, className)}
      role="tab"
      type={type}
      {...props}
    />
  );
}

export function TabsContent({ active = true, className, ...props }: TabsContentProps) {
  return (
    <div className={cn("ui-tabs-content", className)} hidden={!active} role="tabpanel" {...props} />
  );
}

export type ToggleGroupProps = HTMLAttributes<HTMLDivElement>;
export type ToggleGroupItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <div className={cn("ui-toggle-group", className)} role="group" {...props} />;
}

export function ToggleGroupItem({
  className,
  pressed = false,
  type = "button",
  ...props
}: ToggleGroupItemProps) {
  return (
    <button
      aria-pressed={pressed}
      className={cn("ui-toggle-group-item", { "is-active": pressed }, className)}
      type={type}
      {...props}
    />
  );
}
