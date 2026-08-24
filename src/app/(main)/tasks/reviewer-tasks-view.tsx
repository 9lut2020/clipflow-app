"use client";

import { Clip } from "@/types/api";
import { TaskAccordionSection } from "./task-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, Clock } from "lucide-react";

interface ReviewerTasksViewProps {
  clips: Clip[];
}

export function ReviewerTasksView({ clips }: ReviewerTasksViewProps) {
  // Inbox: Clips that specifically need review right now
  const pendingClips = clips.filter((c) => c.status === "PENDING_REVIEW");

  // Group remaining clips (or all clips except draft/approved) by project
  const projectMap = new Map<
    string,
    { id: string; name: string; clips: Clip[] }
  >();

  clips.forEach((clip) => {
    // Exclude DRAFT clips since reviewers shouldn't care about drafts until submitted.
    if (clip.status === "DRAFT") return;

    const projectId = clip.project?.id || "unassigned";
    const projectName = clip.project?.name || "ไม่ได้ระบุโปรเจกต์";

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        id: projectId,
        name: projectName,
        clips: [],
      });
    }
    projectMap.get(projectId)!.clips.push(clip);
  });

  const projects = Array.from(projectMap.values());

  return (
    <div className="space-y-6">
      {/* INBOX SECTION */}
      {pendingClips.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={16} />
            คลิปที่รอตรวจด่วน
          </h2>
          <TaskAccordionSection
            title="รอการตรวจ"
            iconType="clock"
            clips={pendingClips}
            colorClass="text-amber-500"
            badgeBg="bg-amber-100 text-amber-700"
            emptyText="ไม่มีงานรอตรวจ"
            defaultOpen={true}
            isUser={false}
          />
        </div>
      )}

      {/* PROJECT GROUPS */}
      <div>
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FolderKanban size={16} />
          ภาพรวมแยกตามโปรเจกต์
        </h2>

        {projects.length === 0 ? (
          <Card className="border-dashed border-slate-200 bg-slate-50/50 shadow-none">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500 font-medium">
                ยังไม่มีคลิปที่ดำเนินการอยู่ในระบบ
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <TaskAccordionSection
                key={project.id}
                title={project.name}
                iconType="play"
                clips={project.clips}
                colorClass="text-slate-700"
                badgeBg="bg-slate-200 text-slate-800"
                emptyText="ไม่มีคลิป"
                defaultOpen={true}
                isUser={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
