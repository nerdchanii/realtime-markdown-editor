import type { ButtonHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type DropdownMenuProps = DetailsHTMLAttributes<HTMLDetailsElement>;

export function DropdownMenu({ className, ...props }: DropdownMenuProps) {
  return <details className={cn("ui-dropdown", className)} {...props} />;
}

export type DropdownMenuTriggerProps = HTMLAttributes<HTMLElement>;

export function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  return <summary className={cn("ui-dropdown-trigger", className)} {...props} />;
}

export type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement>;

export function DropdownMenuContent({ className, ...props }: DropdownMenuContentProps) {
  return <div className={cn("ui-dropdown-content", className)} role="menu" {...props} />;
}

export type DropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
};

export function DropdownMenuItem({
  className,
  inset = false,
  type = "button",
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      className={cn("ui-dropdown-item", { "ui-dropdown-item--inset": inset }, className)}
      role="menuitem"
      type={type}
      {...props}
    />
  );
}
