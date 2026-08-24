import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function ManageProjectLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      <SkeletonHeader />
      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      {/* Spreadsheet toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <div className="ml-auto">
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        {/* Table header */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-3 py-2 gap-3">
          <Skeleton className="h-4 w-6 rounded" />
          {[60, 48, 120, 80, 100, 90].map((w, i) => (
            <Skeleton key={i} className={`h-4 w-${w} rounded`} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center border-b border-slate-100 px-3 py-2 gap-3 last:border-0">
            <Skeleton className="h-4 w-6 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-48 rounded flex-1" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
