import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Ladda input — 6px radius, hairline border, no shadow. On focus the
 * border goes `growth` with a soft `growth` halo. `aria-invalid` turns
 * the field `gap` (the warning accent, its only sanctioned use here).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-control border border-line bg-surface px-3 py-1",
        "font-sans text-sm text-ink transition-[color,border-color,box-shadow] duration-150 ease-climb",
        "placeholder:text-ink-muted/70 selection:bg-growth-soft selection:text-ink",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        "outline-none focus-visible:border-growth focus-visible:ring-2 focus-visible:ring-growth/25",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-gap aria-invalid:focus-visible:ring-gap/25",
        className
      )}
      {...props}
    />
  );
}

export { Input };
