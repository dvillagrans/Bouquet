"use client";

import { cn } from "@/lib/utils";

export function MesaCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "waiter-shimmer relative h-[22rem] overflow-hidden rounded-[20px] border border-border-main bg-bg-card p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-24 rounded-full bg-bg-solid/80" />
        <div className="h-9 w-9 rounded-full bg-bg-solid/80" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-3 w-14 rounded bg-bg-solid/70" />
        <div className="h-14 w-28 rounded-lg bg-bg-solid/80 sm:h-16 sm:w-32" />
        <div className="h-3 w-full max-w-[12rem] rounded bg-bg-solid/60" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 mt-auto grid grid-cols-3 divide-x divide-border-main/50 border-t border-border-main/60 pt-4">
        <div className="pr-2 pt-1">
          <div className="mx-auto h-2 w-10 rounded bg-bg-solid/50" />
          <div className="mx-auto mt-2 h-7 w-12 rounded-md bg-bg-solid/70" />
        </div>
        <div className="px-2 pt-1">
          <div className="mx-auto h-2 w-10 rounded bg-bg-solid/50" />
          <div className="mx-auto mt-2 h-7 w-12 rounded-md bg-bg-solid/70" />
        </div>
        <div className="pl-2 pt-1">
          <div className="mx-auto h-2 w-10 rounded bg-bg-solid/50" />
          <div className="mx-auto mt-2 h-7 w-14 rounded-md bg-bg-solid/70" />
        </div>
      </div>
    </div>
  );
}
