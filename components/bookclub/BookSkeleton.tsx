"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BookSkeleton() {
  return (
    <div className="flex flex-col bg-[#FCFADE] px-4 md:px-10 py-6 max-w-4xl">
      {/* Title */}
      <Skeleton className="h-10 w-3/4 mb-6" />

      {/* Author / Date section */}
      <div className="flex space-x-4 mb-8">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
      </div>

      {/* Image placeholder */}
      <Skeleton className="h-60 w-full md:w-3/4 mb-8" />

      {/* Content paragraphs */}
      <div className="space-y-4 mb-8">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-10/12" />
      </div>

      {/* CTA buttons */}
      <div className="flex space-x-4 mt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
