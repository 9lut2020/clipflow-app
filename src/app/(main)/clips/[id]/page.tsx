import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClipStepper from "@/components/clips/clip-stepper";
import ClipViewClient from "./clip-view-client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiServer } from "@/lib/api-server";
import { notFound } from "next/navigation";

export default async function ClipDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  // Get current user from actual session
  const currentUser = session?.user;
  const isUser = currentUser?.role === "USER";

  let clip: any = null;
  let allRevisions: any[] = [];

  try {
    const clipsRes = await apiServer.get<any>(`/clips/${params.id}`);
    clip = clipsRes.data;

    const revsRes = await apiServer
      .get<any>(`/clips/${params.id}/revisions`)
      .catch(() => ({ data: [] }));
    allRevisions = Array.isArray(revsRes.data) ? revsRes.data : [];
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
