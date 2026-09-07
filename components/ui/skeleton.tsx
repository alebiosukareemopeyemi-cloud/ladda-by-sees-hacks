import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — a single placeholder block. Neutral fill plus the shared
 * `shimmer` sweep (which stills itself under `prefers-reduced-motion`).
 * Compose several to pre-draw a real layout; never ship a spinner.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "shimmer rounded-control bg-line/60",
        className
      )}
      {...props}
    />
  );
}

/** A stack of text-line skeletons; the last line is shortened. */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 && "w-3/5")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
