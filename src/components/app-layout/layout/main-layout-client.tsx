"use client";

import { useState, Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/app-layout/layout/sidebar";
import Topbar from "@/components/app-layout/layout/topbar";
import BottomNav from "@/components/liff/bottom-nav";
import { useAnalytics } from "@/hooks/use-analytics";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (pathname) {
      trackEvent({ eventName: "page_view", properties: { path: pathname } });
    }
  }, [pathname, trackEvent]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 text-gray-900">
      <Suspense fallback={<Skeleton className="w-[72px] h-full rounded-none" />}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
        />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
        />
        {/* pb-32 on mobile to avoid overlapping with BottomNav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pb-32 md:pb-6">
          {children}
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden">
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
