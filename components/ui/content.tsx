import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import {
  ErrorWithRetry,
  type ErrorWithRetryProps,
} from "@/components/ui/error-with-retry";

type ErrorLike = string | { message: string } | null | undefined;

function messageOf(err: ErrorLike): string | null {
  if (!err) return null;
  return typeof err === "string" ? err : err.message;
}

export interface ContentProps {
  /** True while the data for this surface is in flight. */
  loading?: boolean;
  /** A string, an object with `.message`, or null/undefined for "no error". */
  error?: ErrorLike;
  /** Passed straight through to ErrorWithRetry. */
  onRetry?: () => void;
  retry?: Pick<ErrorWithRetryProps, "title" | "retryLabel">;
  /** Custom loading placeholder. Falls back to a generic block skeleton. */
  skeleton?: React.ReactNode;
  /** Skip the fade + rise on the content state (§9 page-enter). */
  noEnterAnimation?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Content — the one wrapper every async surface goes through, so all
 * three designed states (skeleton · content · error-with-retry, §9) are
 * consistent and nobody hand-rolls a spinner. Precedence: error, then
 * loading, then children.
 */
function ContentBase({
  loading = false,
  error,
  onRetry,
  retry,
  skeleton,
  noEnterAnimation = false,
  className,
  children,
}: ContentProps) {
  const errMessage = messageOf(error);

  if (errMessage) {
    return (
      <div className={className}>
        <ErrorWithRetry
          message={errMessage}
          onRetry={onRetry}
          title={retry?.title}
          retryLabel={retry?.retryLabel}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={className} aria-busy="true">
        {skeleton ?? <DefaultSkeleton />}
      </div>
    );
  }

  return (
    <div className={cn(!noEnterAnimation && "animate-enter", className)}>
      {children}
    </div>
  );
}

/** The default placeholder: a title bar over three text lines in a card. */
function DefaultSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-line bg-surface p-5",
        className
      )}
    >
      <Skeleton className="h-5 w-2/5" />
      <SkeletonText lines={3} />
    </div>
  );
}

/** `Content` with its default skeleton attached as `Content.Skeleton`. */
const Content = Object.assign(ContentBase, { Skeleton: DefaultSkeleton });

export { Content };
