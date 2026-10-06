import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClipStepper from "@/components/clips/clip-stepper";
import ClipViewClient from "./clip-view-client";

import { apiServer, getSession } from "@/lib/api-server";
import { notFound } from "next/navigation";

export default async function ClipDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await props.params;
  const session = await getSession();

  // Get current user from actual session
  const currentUser = session?.user;
  const isUser = currentUser?.role === "USER";

  let clip: any = null;
  let allRevisions: any[] = [];

  try {
    const [clipsRes, revsRes] = await Promise.all([
      apiServer.get<any>(`/clips/${params.id}`),
      // Paginated response: { items, pagination }. Latest revision first.
      apiServer
        .get<any>(`/clips/${params.id}/revisions?page=1&limit=100&sortBy=revisionNo&sortOrder=desc`)
        .catch(() => ({ data: null })),
    ]);
    clip = clipsRes.data;
    const revisionData = revsRes.data;
    allRevisions = Array.isArray(revisionData) ? revisionData : revisionData?.items ?? [];
  } catch (err) {
    clip = null;
  }

  // If clip is not found or error occurred, trigger 404 page cleanly
  if (!clip) {
    notFound();
  }

  const latestRevision = allRevisions.length > 0 ? allRevisions[0] : null;
  const project = clip.project;
  const episode = clip.episode;
  const owner = clip.owner;

  return (
    <div className="max-w-full mx-auto pb-24 lg:pb-12 px-1 sm:px-0">
      <ClipViewClient
        clip={clip}
        allRevisions={allRevisions}
        currentUser={currentUser}
        isUser={!!isUser}
      />
    </div>
  );
}
