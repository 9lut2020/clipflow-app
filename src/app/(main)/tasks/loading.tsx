import { Skeleton, SkeletonRow, SkeletonHeader } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      <SkeletonHeader />
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Skeleton className="h-9 w-full sm:w-64 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {/* Task groups */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="p-4 space-y-1">
            {Array.from({ length: 3 }).map((_, j) => (
              <SkeletonRow key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
