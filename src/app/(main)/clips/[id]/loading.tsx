import { Skeleton } from "@/components/ui/skeleton";

export default function ClipDetailLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8 items-start pb-56 lg:pb-8 animate-in fade-in duration-300">
      {/* Left: Video + details */}
      <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
        {/* Video player */}
        <Skeleton className="w-full aspect-[4/5] sm:aspect-[16/10] rounded-lg" />

        {/* Clip detail card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
            <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Review card + timeline */}
      <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-11 rounded-xl" />
              <Skeleton className="flex-1 h-11 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
