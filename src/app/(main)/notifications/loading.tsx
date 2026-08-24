import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      <SkeletonHeader />
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 sm:px-6">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
