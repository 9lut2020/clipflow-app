"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { signOut } from "next-auth/react";

export function SessionWatcher() {
  const { data: session, update, status } = useSession();
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || session.user.isBypass) return;

    const checkUserStatus = async () => {
      if (isUpdatingRef.current) return;
      try {
        const res = await apiClient.get<any>(`/users/${session.user.id}`);
        if (res.status === "success" && res.data) {
          const dbUser = res.data;

          // 1. If user is deactivated, sign them out immediately
          if (dbUser.isActive === false) {
            isUpdatingRef.current = true;
            await signOut({ callbackUrl: "/login" });
            return;
          }

          // 2. If user role changed in DB compared to session role
          if (dbUser.role !== session.user.role) {
            isUpdatingRef.current = true;
            await update();
            window.location.reload();
          }
        }
      } catch (err) {
        console.error("SessionWatcher error checking user status:", err);
      }
    };

    // Check once immediately on load
    checkUserStatus();

    // Then check every 5 seconds for fast response time
    const interval = setInterval(checkUserStatus, 5000);

    return () => clearInterval(interval);
  }, [session, status, update]);

  return null;
}
