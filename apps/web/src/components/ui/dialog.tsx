import type { ButtonHTMLAttributes, DialogHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";
import { Button } from "./button.js";

export type DialogProps = DialogHTMLAttributes<HTMLDialogElement>;

export function Dialog({ className, ...props }: DialogProps) {
  return <dialog className={cn("ui-dialog", className)} {...props} />;
}

export type DialogContentProps = HTMLAttributes<HTMLDivElement>;

export function DialogContent({ className, ...props }: DialogContentProps) {
  return <div className={cn("ui-dialog-content", className)} {...props} />;
}

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div className={cn("ui-dialog-header", className)} {...props} />;
}

export type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
  return (
    <h2 className={cn("ui-dialog-title", className)} {...props}>
      {children}
    </h2>
  );
}

export type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <p className={cn("ui-dialog-description", className)} {...props} />;
}

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <div className={cn("ui-dialog-footer", className)} {...props} />;
}

export type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DialogClose({ className, children = "Close", ...props }: DialogCloseProps) {
  return (
    <Button className={cn("ui-dialog-close", className)} variant="ghost" {...props}>
      {children}
    </Button>
  );
}
