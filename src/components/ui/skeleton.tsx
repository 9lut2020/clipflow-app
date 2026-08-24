import { cn } from "@/utils/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
}

/** A card-shaped skeleton block */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white p-4 space-y-3", className)}>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

/** A single horizontal row skeleton (for lists/tables) */
function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3 border-b border-slate-100 last:border-0", className)}>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full shrink-0" />
    </div>
  );
}

/** A stat card skeleton */
function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white p-4 flex items-center gap-3", className)}>
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-10" />
      </div>
    </div>
  );
}

/** Page header skeleton (back button + title) */
function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-9 w-24 rounded-xl" />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonStat, SkeletonHeader };
