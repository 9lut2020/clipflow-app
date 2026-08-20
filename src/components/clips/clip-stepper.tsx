"use client";

import { Check, Clock, UploadCloud, Eye, AlertCircle } from "lucide-react";
import { cn } from "@/utils/utils";

type ClipStatus = "DRAFT" | "PENDING_REVIEW" | "IN_REVIEW" | "NEEDS_REVISION" | "APPROVED";

interface ClipStepperProps {
  status: ClipStatus;
  className?: string;
}

export default function ClipStepper({ status, className }: ClipStepperProps) {
  const isDraft = status === "DRAFT";
  const isPending = status === "PENDING_REVIEW";
  const isInReview = status === "IN_REVIEW";
  const isNeedsRevision = status === "NEEDS_REVISION";
  const isApproved = status === "APPROVED";

  const isStep1Complete = isPending || isInReview || isNeedsRevision || isApproved;
  const isStep2Complete = isNeedsRevision || isApproved;
  
  const step1State = isStep1Complete ? "complete" : "current";
  const step2State = isStep2Complete ? "complete" : (isPending || isInReview ? "current" : "upcoming");
  const step3State = isApproved ? "success" : (isNeedsRevision ? "error" : "upcoming");

  const steps = [
    {
      id: 1,
      name: "ส่งงาน",
      description: "อัปโหลดคลิป",
      state: step1State,
      icon: isStep1Complete ? Check : UploadCloud,
    },
    {
      id: 2,
      name: "กำลังตรวจ",
      description: "รอผลการตรวจ",
      state: step2State,
      icon: isStep2Complete ? Check : (isPending || isInReview ? Eye : Clock),
    },
    {
      id: 3,
      name: isApproved ? "อนุมัติ" : (isNeedsRevision ? "ต้องแก้ไข" : "ผลตรวจ"),
      description: isApproved ? "เสร็จสมบูรณ์" : (isNeedsRevision ? "รอการส่งใหม่" : "ขั้นตอนสุดท้าย"),
      state: step3State,
      icon: isApproved ? Check : (isNeedsRevision ? AlertCircle : Check),
    },
  ];

  return (
    <div className={cn("w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8", className)}>
      <nav aria-label="Progress" className="w-full">
        <div className="relative flex justify-between w-full max-w-2xl mx-auto">
          {/* Background Line */}
          <div className="absolute top-5 sm:top-6 left-6 right-6 h-1 sm:h-1.5 bg-slate-100 rounded z-0" />
          
          {/* Progress Line */}
          <div 
            className="absolute top-5 sm:top-6 left-6 h-1 sm:h-1.5 bg-emerald-500 rounded z-0 transition-all duration-500" 
            style={{ 
              width: isStep2Complete ? 'calc(100% - 3rem)' : isStep1Complete ? 'calc(50% - 1.5rem)' : '0%' 
            }} 
          />

          {steps.map((step, stepIdx) => (
            <div key={step.name} className="relative z-10 flex flex-col items-center w-24">
              {/* Circle Indicator */}
              <div 
                className={cn(
                  "relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-all duration-500 bg-white",
                  step.state === "complete" ? "border-emerald-500 bg-emerald-500 text-white shadow-sm" :
                  step.state === "success" ? "border-emerald-500 bg-emerald-500 text-white shadow-sm" :
                  step.state === "error" ? "border-rose-500 bg-rose-500 text-white shadow-sm" :
                  step.state === "current" ? "border-sky-500 text-sky-600 ring-4 ring-sky-50" :
                  "border-slate-200 text-slate-400"
                )}
              >
                <step.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={step.state === "current" ? 2.5 : 3} />
              </div>

              {/* Text Label */}
              <div className="mt-3 flex flex-col items-center text-center">
                <span 
                  className={cn(
                    "text-[11px] sm:text-sm font-bold",
                    step.state === "complete" || step.state === "success" ? "text-emerald-700" :
                    step.state === "error" ? "text-rose-700" :
                    step.state === "current" ? "text-sky-700" :
                    "text-slate-500"
                  )}
                >
                  {step.name}
                </span>
                <span className="hidden sm:block text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
