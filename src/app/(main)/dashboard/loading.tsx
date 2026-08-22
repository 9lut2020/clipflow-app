import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-full mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <Skeleton className="h-6 sm:h-7 w-48 mb-1.5" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <Skeleton className="h-8 w-16 sm:w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 sm:w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 sm:w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 sm:w-20 rounded-lg" />
        </div>
      </div>

      {/* QUICK STATS (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* SEARCH & FILTERS ROW */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full md:w-[350px] rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl hidden md:block" />
        <Skeleton className="h-10 w-10 md:w-24 rounded-xl ml-auto md:ml-0" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* TABLE SECTION (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR WIDGETS (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
