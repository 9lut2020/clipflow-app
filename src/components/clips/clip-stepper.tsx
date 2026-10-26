"use client";

import { Check, Clock, UploadCloud, Eye, AlertCircle, Share2, Ban } from "lucide-react";
import { cn } from "@/utils/utils";
import { clipStage } from "@/lib/clip-status";

interface ClipStepperProps {
  status: string;
  /** False for a draft nobody has been given yet ("รอมอบหมาย"). */
  assigned?: boolean;
  className?: string;
}

type StepState = "complete" | "current" | "error" | "upcoming";

/**
 * Four-step pipeline: ส่งงาน → ตรวจงาน → ผ่านการตรวจ → เผยแพร่.
 * Driven by the clip's stage, so every status (RESUBMITTED, PUBLISHED, …)
 * lands on the right step.
 */
export default function ClipStepper({ status, assigned = true, className }: ClipStepperProps) {
  const stage = clipStage(status);

  if (stage === "cancelled") {
    return (
      <div className={cn("flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 shadow-sm sm:rounded-2xl", className)}>
        <Ban className="h-4 w-4" /> คลิปนี้ถูกยกเลิกแล้ว
      </div>
    );
  }

  // How many steps are fully done.
  const done = { unassigned: 0, todo: 0, review: 1, fix: 1, ready: 3, published: 4 }[stage];

  const steps: { name: string; description: string; state: StepState; icon: typeof Check }[] = [
    {
      name: stage === "todo" && !assigned ? "รอมอบหมาย" : "ส่งงาน",
      description: stage === "todo" ? (assigned ? "รอคนตัดต่อส่งคลิป" : "ยังไม่มีคนตัดต่อ") : "ส่งคลิปแล้ว",
      state: done >= 1 ? "complete" : "current",
      icon: done >= 1 ? Check : UploadCloud,
    },
    {
      name: stage === "fix" ? "ต้องแก้ไข" : "ตรวจงาน",
      description: stage === "fix" ? "รอส่งงานแก้ไข" : stage === "review" ? (status === "RESUBMITTED" ? "ส่งแก้แล้ว รอตรวจ" : "รอผลการตรวจ") : done >= 2 ? "ตรวจแล้ว" : "รอส่งงาน",
      state: stage === "fix" ? "error" : stage === "review" ? "current" : done >= 2 ? "complete" : "upcoming",
      icon: stage === "fix" ? AlertCircle : stage === "review" ? Eye : done >= 2 ? Check : Clock,
    },
    {
      name: "ผ่านการตรวจ",
      description: done >= 3 ? "อนุมัติแล้ว" : "รอผลตรวจ",
      state: done >= 3 ? "complete" : "upcoming",
      icon: Check,
    },
    {
      name: "เผยแพร่",
      description: stage === "published" ? "โพสต์แล้ว" : stage === "ready" ? "รอโพสต์" : "ขั้นตอนสุดท้าย",
      state: stage === "published" ? "complete" : stage === "ready" ? "current" : "upcoming",
      icon: stage === "published" ? Check : Share2,
    },
  ];

  // Line runs to the last reached step (the current one when there is one).
  const reached = steps.reduce((last, step, index) => (step.state !== "upcoming" ? index : last), 0);
  const progress = (reached / (steps.length - 1)) * 100;

  return (
    <div className={cn("w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8", className)}>
      <nav aria-label="ขั้นตอนของคลิป" className="w-full">
        <div className="relative mx-auto flex w-full max-w-3xl justify-between">
          <div className="absolute left-6 right-6 top-5 z-0 h-1 rounded bg-slate-100 sm:top-6 sm:h-1.5" />
          <div className="absolute left-6 right-6 top-5 z-0 h-1 sm:top-6 sm:h-1.5">
            <div className="h-full rounded bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {steps.map((step) => (
            <div key={step.name} className="relative z-10 flex w-16 flex-col items-center sm:w-24">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all duration-500 sm:h-12 sm:w-12",
                  step.state === "complete" ? "border-emerald-500 bg-emerald-500 text-white shadow-sm" :
                  step.state === "error" ? "border-rose-500 bg-rose-500 text-white shadow-sm" :
                  step.state === "current" ? "border-sky-500 text-sky-600 ring-4 ring-sky-50" :
                  "border-slate-200 text-slate-400"
                )}
                aria-current={step.state === "current" ? "step" : undefined}
              >
                <step.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={step.state === "current" ? 2.5 : 3} />
              </div>
              <div className="mt-3 flex flex-col items-center text-center">
                <span
                  className={cn(
                    "text-[11px] font-bold sm:text-sm",
                    step.state === "complete" ? "text-emerald-700" :
                    step.state === "error" ? "text-rose-700" :
                    step.state === "current" ? "text-sky-700" :
                    "text-slate-500"
                  )}
                >
                  {step.name}
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-slate-400 sm:text-[11px]">{step.description}</span>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
