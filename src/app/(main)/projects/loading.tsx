import { Skeleton, SkeletonHeader } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      <SkeletonHeader />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2 mt-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
