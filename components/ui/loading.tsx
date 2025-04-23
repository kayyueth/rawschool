"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "inline" | "fullPage";
  count?: number;
}

export function Loading({
  variant = "default",
  count = 3,
  className,
  ...props
}: LoadingProps) {
  // Full page loading spinner with background
  if (variant === "fullPage") {
    return (
      <div
        className="min-h-screen bg-[#FCFADE] flex justify-center items-center"
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 border-t-2 border-black rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading</p>
        </div>
      </div>
    );
  }

  // Inline loading spinner
  if (variant === "inline") {
    return (
      <div
        className={cn("flex items-center justify-center py-2", className)}
        {...props}
      >
        <div className="h-4 w-4 border-t-2 border-black rounded-full animate-spin mr-2"></div>
        <p className="text-sm">Loading</p>
      </div>
    );
  }

  // Card loading skeletons
  if (variant === "card") {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2", className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card text-card-foreground shadow"
          >
            <div className="p-6 flex flex-col space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default loading skeletons
  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
