import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("ui-input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn("ui-input", "ui-textarea", className)} {...props} />;
}
