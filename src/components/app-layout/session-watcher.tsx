"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { signOut } from "next-auth/react";
import type { User } from "@/types/api";

export function SessionWatcher() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const sessionRole = session?.user?.role;
  const isBypass = session?.user?.isBypass;
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !userId || isBypass) return;

    const checkUserStatus = async () => {
      if (isUpdatingRef.current) return;
      try {
        const res = await apiClient.get<User>(`/users/${userId}`);
        if (res.status === "success" && res.data) {
          const dbUser = res.data;

          // 1. If user is deactivated, sign them out immediately
          if (dbUser.isActive === false) {
            isUpdatingRef.current = true;
            await signOut({ callbackUrl: "/login" });
            return;
          }

          // 2. If user role changed in DB compared to session role
          if (dbUser.role !== sessionRole) {
            isUpdatingRef.current = true;
            await update({
              role: dbUser.role,
              name: dbUser.displayName ?? session?.user?.name,
              image: dbUser.pictureUrl ?? session?.user?.image,
            });
            router.refresh();
          }
        }
      } catch (err) {
        console.error("SessionWatcher error checking user status:", err);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    // Check once immediately on load
    checkUserStatus();

    // Then check every 5 seconds for fast response time
    const interval = setInterval(checkUserStatus, 5000);

    return () => clearInterval(interval);
  }, [userId, sessionRole, isBypass, status, update, router, session?.user?.name, session?.user?.image]);

  return null;
}
