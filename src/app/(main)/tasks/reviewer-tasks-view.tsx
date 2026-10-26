"use client";

import Link from "next/link";
import { Clip } from "@/types/api";
import { TaskAccordionSection } from "./task-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { clipStageOf, type ClipStage } from "@/lib/clip-status";

interface ReviewerTasksViewProps {
  clips: Clip[];
  isAdmin?: boolean;
}

/**
 * Reviewer / admin work list, one section per pipeline stage in the order the
 * work happens. Every clip lands in exactly one section; cancelled clips are
 * hidden. Finished stages start collapsed so the open work stays on top.
 */
export function ReviewerTasksView({ clips, isAdmin = false }: ReviewerTasksViewProps) {
  const byStage = (stage: ClipStage) => clips.filter((c) => clipStageOf(c as any) === stage);
  const review = byStage("review");
  const fix = byStage("fix");
  const unassigned = byStage("unassigned");
  const todo = byStage("todo");
  const ready = byStage("ready");
  const published = byStage("published");
  const nothing = unassigned.length + review.length + fix.length + todo.length + ready.length + published.length === 0;

  return (
    <div className="space-y-1">
      <TaskAccordionSection
        title="รอตรวจ"
        iconType="clock"
        clips={review}
        colorClass="text-amber-500"
        badgeBg="bg-amber-100 text-amber-700"
        emptyText="ไม่มีงานรอตรวจ"
        defaultOpen={true}
        isUser={false}
      />

      <TaskAccordionSection
        title="ต้องแก้ไข (รอคนตัดต่อส่งใหม่)"
        iconType="alert"
        clips={fix}
        colorClass="text-rose-500"
        badgeBg="bg-rose-100 text-rose-700"
        emptyText="ไม่มีงานที่ต้องแก้ไข"
        defaultOpen={true}
        isUser={false}
      />

      {isAdmin && (
        <TaskAccordionSection
          title="รอมอบหมาย (ยังไม่มีคนตัดต่อ)"
          iconType="alert"
          clips={unassigned}
          colorClass="text-violet-500"
          badgeBg="bg-violet-100 text-violet-700"
          emptyText=""
          defaultOpen={true}
          isUser={false}
        />
      )}

      {isAdmin && (
        <TaskAccordionSection
          title="รอส่งงาน"
          iconType="play"
          clips={todo}
          colorClass="text-slate-600"
          badgeBg="bg-slate-200 text-slate-700"
          emptyText="ไม่มีงานรอส่ง"
          defaultOpen={false}
          isUser={false}
        />
      )}

      {ready.length > 0 && (
        <div>
          {isAdmin && (
            <div className="mb-2 flex justify-end">
              <Link href="/admin/publish" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                <Share2 size={14} /> ไปหน้าเผยแพร่
              </Link>
            </div>
          )}
          <TaskAccordionSection
            title="ผ่านแล้ว รอโพสต์"
            iconType="check"
            clips={ready}
            colorClass="text-emerald-500"
            badgeBg="bg-emerald-100 text-emerald-700"
            emptyText=""
            defaultOpen={false}
            isUser={false}
          />
        </div>
      )}

      <TaskAccordionSection
        title="เผยแพร่แล้ว"
        iconType="check"
        clips={published}
        colorClass="text-indigo-500"
        badgeBg="bg-indigo-100 text-indigo-700"
        emptyText=""
        defaultOpen={false}
        isUser={false}
      />

      {nothing && (
        <Card className="border-dashed border-slate-200 bg-slate-50/50 shadow-none">
          <CardContent className="p-8 text-center">
            <p className="font-medium text-slate-500">ยังไม่มีคลิปในระบบ</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
