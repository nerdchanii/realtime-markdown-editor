import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils.js";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Switch({ className, ...props }: SwitchProps) {
  return <input className={cn("ui-switch", className)} role="switch" type="checkbox" {...props} />;
}
