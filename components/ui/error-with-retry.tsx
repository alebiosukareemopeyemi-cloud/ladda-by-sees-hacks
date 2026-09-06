"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorWithRetryProps {
  /** Short headline. Defaults to a neutral, non-alarming line. */
  title?: string;
  /** User-readable detail — never a raw stack or error code. */
  message: string;
  /** Omit to hide the button (e.g. when nothing can be retried). */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * ErrorWithRetry — the third designed async state (§9). Uses the `gap`
 * accent (its sanctioned "warning only" job), states what went wrong in
 * plain language, and always names the next action on the button.
 */
function ErrorWithRetry({
  title = "That didn't load",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorWithRetryProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-gap/25 bg-gap-soft/60 px-6 py-8 text-center",
        className
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-pill bg-gap-soft text-gap [&_svg]:size-4.5">
        <AlertTriangle />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        <p className="mx-auto max-w-[46ch] text-sm text-ink-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorWithRetry };
