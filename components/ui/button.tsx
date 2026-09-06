"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Ladda button — Radix `Slot` for `asChild`, rethemed off the §9 tokens.
 * Deliberately not the stock shadcn look: 6px control radius, a tight
 * negative tracking, a 1px press translate, and a ringed (un-offset)
 * focus state in `growth`.
 */
const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-control font-sans font-medium tracking-[-0.01em]",
    "transition-[background-color,border-color,box-shadow,transform,color] duration-150 ease-climb",
    "outline-none focus-visible:ring-2 focus-visible:ring-growth",
    "disabled:pointer-events-none disabled:opacity-45",
    "active:translate-y-px",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* progress / primary CTA */
        primary: "bg-growth text-surface shadow-control hover:bg-growth/90",
        /* credentials, verification, trust */
        verified:
          "bg-verified text-surface shadow-control hover:bg-verified/90",
        outline:
          "border border-line bg-surface text-ink hover:border-ink-muted/45 hover:bg-paper",
        subtle: "bg-growth-soft text-growth hover:bg-growth-soft/65",
        ghost: "text-ink-muted hover:bg-paper hover:text-ink",
        /* destructive-adjacent: only ever a warning, never an accent */
        warn: "border border-gap/30 bg-gap-soft text-gap hover:bg-gap-soft/70",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
