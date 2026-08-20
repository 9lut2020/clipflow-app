import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

interface TrackEventPayload {
  eventName: string;
  properties?: Record<string, any>;
  context?: Record<string, any>;
}

export function useAnalytics() {
  const { data: session } = useSession();

  const trackEvent = useCallback(
    async ({ eventName, properties, context }: TrackEventPayload) => {
      // Don't track if not authenticated to prevent flooding or errors
      if (!session?.user?.id) return;

      try {
        // We use fire-and-forget approach for tracking events. We do not await it
        // unless explicitly needed, and we swallow errors so it never breaks the UI.
        const defaultContext = {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          liffClient: typeof navigator !== "undefined" ? navigator.userAgent.includes("Line") : false,
          platform: typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
          ...context,
        };

        apiClient
          .post("/analytics/track", {
            eventName,
            properties: properties || {},
            context: defaultContext,
          })
          .catch((err) => {
            console.warn("[Analytics] Track event failed:", err);
          });
      } catch (err) {
        console.warn("[Analytics] Track event setup failed:", err);
      }
    },
    [session?.user?.id]
  );

  return { trackEvent };
}
