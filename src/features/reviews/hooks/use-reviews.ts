import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAnalytics } from "@/hooks/use-analytics";

export function useSubmitRevision() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (clipId: string, data: { driveUrl: string; submitNote: string; submittedBy: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<any>(`/clips/${clipId}/revisions`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to submit revision");
      
      trackEvent({ 
        eventName: "clip_submitted", 
        properties: { clipId, ...data } 
      });
      
      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitRevision: mutateAsync, isSubmitting };
}

export function useSubmitReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();

  const mutateAsync = async (revisionId: string, data: { status: string; comment: string; reviewerId: string }) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<any>(`/revisions/${revisionId}/reviews`, data);
      if (res.status !== "success") throw new Error(res.message || "Failed to submit review");
      
      trackEvent({ 
        eventName: "review_completed", 
        properties: { revisionId, outcome: data.status, hasComment: !!data.comment } 
      });

      return res;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReview: mutateAsync, isSubmitting };
}
