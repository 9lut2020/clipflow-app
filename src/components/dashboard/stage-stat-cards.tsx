"use client";

import { Ban, CheckCircle2, Clock, Send, Share2, TriangleAlert, UserPlus } from "lucide-react";
import { CLIP_STAGES, type ClipStage } from "@/lib/clip-status";

const STAGE_LOOK: Record<ClipStage, { icon: typeof Clock; tone: string; number: string }> = {
  unassigned: { icon: UserPlus, tone: "bg-violet-50 text-violet-600", number: "text-violet-700" },
  todo: { icon: Send, tone: "bg-slate-100 text-slate-600", number: "text-slate-700" },
  review: { icon: Clock, tone: "bg-amber-50 text-amber-600", number: "text-amber-600" },
  fix: { icon: TriangleAlert, tone: "bg-rose-50 text-rose-600", number: "text-rose-600" },
  ready: { icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600", number: "text-emerald-600" },
  published: { icon: Share2, tone: "bg-indigo-50 text-indigo-600", number: "text-indigo-600" },
  cancelled: { icon: Ban, tone: "bg-gray-100 text-gray-500", number: "text-gray-500" },
};

/**
 * One card per pipeline stage — every stage counted on its own, never
 * merged. Tapping a card filters the list below (when `onSelect` is given).
 */
export function StageStatCards({
  counts,
  stages,
  active,
  onSelect,
}: {
  counts: Partial<Record<ClipStage, number>>;
  stages: ClipStage[];
  active?: string;
  onSelect?: (stage: ClipStage | "ALL") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 xl:grid-cols-6">
      {CLIP_STAGES.filter((stage) => stages.includes(stage.id)).map((stage) => {
        const look = STAGE_LOOK[stage.id];
        const Icon = look.icon;
        const isActive = active === stage.id;
        const Tag = onSelect ? "button" : "div";
        return (
          <Tag
            key={stage.id}
            {...(onSelect ? { type: "button" as const, onClick: () => onSelect(isActive ? "ALL" : stage.id), "aria-pressed": isActive } : {})}
            title={stage.hint}
            className={`rounded-xl border bg-white p-3 text-left shadow-xs transition-all md:p-4 ${isActive ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200/80"} ${onSelect ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm" : ""}`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold leading-tight text-slate-500">{stage.label}</span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${look.tone}`}><Icon size={15} /></span>
            </div>
            <div className={`text-xl font-black tracking-tight md:text-3xl ${look.number}`}>
              {counts[stage.id] ?? 0} <span className="text-[10px] font-normal text-slate-500 md:text-xs">รายการ</span>
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
