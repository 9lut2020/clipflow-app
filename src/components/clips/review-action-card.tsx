"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useSubmitRevision, useSubmitReview } from "@/features/reviews/hooks/use-reviews";
import { toast } from "sonner";
import ReviewConfirmModal, {
  type ReviewConfirmAction,
} from "@/components/clips/review-confirm-modal";
import { validateVideoUrl } from "@/utils/url-validator";
import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";

interface ReviewActionCardProps {
  clip: any;
  isUser: boolean;
  reviewerId: string;
  currentTimeFormatted?: string | null;
  currentTimeSeconds?: number | null;
  onOptimisticUpdate?: (status: string) => void;
}

export default function ReviewActionCard({
  clip,
  isUser,
  reviewerId,
  currentTimeFormatted,
  currentTimeSeconds,
  onOptimisticUpdate,
}: ReviewActionCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { submitRevision, isSubmitting: isSubmittingRevision } =
    useSubmitRevision();
  const { submitReview, isSubmitting: isSubmittingReview } = useSubmitReview();
  const isLoading = isSubmittingRevision || isSubmittingReview;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Reviewer shortcuts (Trigger Confirmation Modal first)
      if (
        !isUser &&
        (clip.status === "PENDING_REVIEW" ||
          clip.status === "IN_REVIEW" ||
          clip.status === "NEEDS_REVISION")
      ) {
        // Ctrl + Enter (Approve)
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          requestApprove();
        }
        // Alt + Enter (Reject)
        if (e.altKey && e.key === "Enter") {
          e.preventDefault();
          requestReject();
        }
      }

      // User shortcuts (Resubmit)
      if (isUser && clip.status === "NEEDS_REVISION") {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          requestResubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clip.status, isUser, clip.currentRevisionId, clip.id, reviewerId]);

  const router = useRouter();
  const [confirmAction, setConfirmAction] =
    useState<ReviewConfirmAction | null>(null);

  const handleApprove = async () => {
    if (!reviewerId) return;
    const targetRevId = clip.currentRevisionId || clip.id;
    if (onOptimisticUpdate) onOptimisticUpdate("APPROVED");
    try {
      await submitReview(targetRevId, {
        status: "APPROVED",
        comment: textareaRef.current?.value || "ผ่านอนุมัติเรียบร้อย",
        reviewerId,
      });
      toast.success("บันทึกผลตรวจผ่านอนุมัติเรียบร้อยแล้ว");
      if (textareaRef.current) textareaRef.current.value = "";
      setConfirmAction(null);
      router.refresh();
    } catch (err: any) {
      onOptimisticUpdate?.(clip.status);
      toast.error(err?.message || "ไม่สามารถบันทึกผลตรวจได้");
    }
  };

  const handleReject = async () => {
    if (!reviewerId) return;
    const targetRevId = clip.currentRevisionId || clip.id;
    if (onOptimisticUpdate) onOptimisticUpdate("NEEDS_REVISION");
    try {
      await submitReview(targetRevId, {
        status: "NEEDS_REVISION",
        comment: textareaRef.current?.value || "ส่งกลับให้ปรับปรุงแก้ไข",
        reviewerId,
      });
      toast.success("ส่งกลับให้แก้ไขเรียบร้อยแล้ว");
      if (textareaRef.current) textareaRef.current.value = "";
      setConfirmAction(null);
      router.refresh();
    } catch (err: any) {
      onOptimisticUpdate?.(clip.status);
      toast.error(err?.message || "ไม่สามารถส่งกลับให้แก้ไขได้");
    }
  };

  const handleResubmit = async () => {
    if (!reviewerId) return;
    const driveUrlInput = document.getElementById("resubmitUrl") as HTMLInputElement;
    const submitNoteInput = document.getElementById("resubmitNote") as HTMLTextAreaElement;

    const driveUrl = driveUrlInput?.value || clip.driveUrl || "";
    const submitNote = submitNoteInput?.value || "";

    // Validate video link before submitting
    const validation = validateVideoUrl(driveUrl);
    if (!validation.valid) {
      toast.error(validation.message);
      setConfirmAction(null);
      return;
    }

    try {
      await submitRevision(clip.id, {
        driveUrl,
        submitNote,
        submittedBy: reviewerId,
      });
      toast.success("ส่งงานแก้ไขใหม่เรียบร้อยแล้ว!");
      setConfirmAction(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "ไม่สามารถส่งงานแก้ไขได้");
    }
  };

  const requestApprove = () => setConfirmAction("APPROVE");
  const requestReject = () => {
    if (!textareaRef.current?.value) {
      toast.error("กรุณากรอกข้อเสนอแนะสิ่งที่ต้องแก้ไขก่อนตีกลับ");
      textareaRef.current?.focus();
      return;
    }
    setConfirmAction("REJECT");
  };
  const requestResubmit = () => {
    const driveUrlInput = document.getElementById("resubmitUrl") as HTMLInputElement;
    const driveUrl = driveUrlInput?.value;

    const validation = validateVideoUrl(driveUrl || clip.driveUrl || "");
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setConfirmAction("RESUBMIT");
  };

  if (isUser && clip.status === "NEEDS_REVISION") {
    return (
      <>
        {confirmAction && (
          <ReviewConfirmModal
            action={confirmAction}
            isLoading={isLoading}
            onCancel={() => setConfirmAction(null)}
            onConfirm={
              confirmAction === "APPROVE"
                ? handleApprove
                : confirmAction === "REJECT"
                  ? handleReject
                  : handleResubmit
            }
          />
        )}
        <div className="w-full bg-white border border-slate-200 border-l-4 border-l-rose-500 rounded-2xl overflow-hidden shadow-xs sm:shadow-sm animate-in fade-in duration-300">
          <div className="flex px-6 py-4 border-b border-slate-100 justify-between items-center bg-rose-50/30">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                ส่งงานแก้ไข
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                วางลิงก์ Google Drive ใหม่ที่แก้ไขแล้ว เพื่อส่งให้ผู้ตรวจเช็คอีกครั้ง
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
              <span>กด</span>
              <kbd className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="font-mono bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                Enter
              </kbd>
              <span>เพื่อส่งงาน</span>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="hidden">
            <h2 className="text-sm font-bold text-slate-800">ส่งงานแก้ไขใหม่</h2>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 space-y-4 lg:space-y-5 max-h-[40vh] lg:max-h-none overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 hidden lg:block">
                Google Drive URL ที่แก้ไขแล้ว
              </label>
              <input
                id="resubmitUrl"
                type="text"
                defaultValue={clip.driveUrl || ""}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 hidden lg:block">
                หมายเหตุการแก้ไข
              </label>
              <Textarea
                id="resubmitNote"
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-rose-500/20 focus:border-rose-500 text-sm resize-none"
                placeholder="เช่น แก้ไขช่วง 01:20 ตามคำแนะนำเรียบร้อยแล้วครับ"
                rows={2}
              />
            </div>
            <button
              type="button"
              onClick={requestResubmit}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm transition-all text-sm cursor-pointer"
            >
              ส่งงานตรวจอีกครั้ง 🚀
            </button>
          </div>
        </div>
      </>
    );
  }

  if (
    !isUser &&
    (clip.status === "PENDING_REVIEW" ||
      clip.status === "IN_REVIEW" ||
      clip.status === "NEEDS_REVISION")
  ) {
    return (
      <>
        {confirmAction && (
          <ReviewConfirmModal
            action={confirmAction}
            isLoading={isLoading}
            onCancel={() => setConfirmAction(null)}
            onConfirm={
              confirmAction === "APPROVE"
                ? handleApprove
                : confirmAction === "REJECT"
                  ? handleReject
                  : handleResubmit
            }
          />
        )}
        <div className="w-full bg-white border border-slate-200 border-l-4 border-l-sky-500 rounded-2xl overflow-hidden shadow-xs sm:shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg shrink-0">
                <ClipboardCheck size={20} />
              </div>
              <h2 className="text-base xl:text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap">
                ผลการตรวจทาน
              </h2>
            </div>
            
            <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
              {/* Reject Shortcut */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs">
                <XCircle size={14} className="text-rose-500 shrink-0" />
                <span className="text-slate-700 font-bold uppercase tracking-wider hidden 2xl:inline-block">ตีกลับ:</span>
                <div className="flex items-center gap-0.5">
                  <kbd className="font-mono font-bold bg-slate-100 px-1 rounded text-slate-600">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="font-mono font-bold bg-slate-100 px-1 rounded text-slate-600">Enter</kbd>
                </div>
              </div>
              
              {/* Approve Shortcut */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span className="text-slate-700 font-bold uppercase tracking-wider hidden 2xl:inline-block">ผ่าน:</span>
                <div className="flex items-center gap-0.5">
                  <kbd className="font-mono font-bold bg-slate-100 px-1 rounded text-slate-600">Ctrl</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="font-mono font-bold bg-slate-100 px-1 rounded text-slate-600">Enter</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="hidden">
            <h2 className="text-sm font-bold text-slate-800">ดำเนินการตรวจ</h2>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 space-y-4 lg:space-y-5 max-h-[40vh] lg:max-h-none overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 hidden lg:block">
                  ข้อเสนอแนะ / สิ่งที่ต้องแก้ไข
                </label>
                {currentTimeFormatted && (
                  <button
                    type="button"
                    onClick={() => {
                      if (textareaRef.current) {
                        const cur = textareaRef.current.value;
                        textareaRef.current.value = cur
                          ? `[${currentTimeFormatted}] ${cur}`
                          : `[${currentTimeFormatted}] `;
                        textareaRef.current.focus();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>📌 ปักหมุดเวลา</span>
                    <span className="font-mono text-amber-900">({currentTimeFormatted})</span>
                  </button>
                )}
              </div>
              <Textarea
                ref={textareaRef}
                autoFocus
                className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-sky-500/20 focus:border-sky-500 text-sm resize-none"
                placeholder={currentTimeFormatted ? "พิมพ์สิ่งที่ต้องแก้ไขให้ทีมตัดต่อ หรือกดปุ่มปักหมุดเวลาเพื่อระบุวินาที..." : "พิมพ์สิ่งที่ต้องแก้ไข (สามารถพิมพ์เวลาเช่น [01:15] เพื่อระบุวินาทีได้)"}
                rows={2}
              />
            </div>
            <div className="flex gap-3 lg:gap-4">
              <button
                type="button"
                onClick={requestReject}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold shadow-sm transition-all text-sm cursor-pointer"
              >
                ✕ ส่งกลับแก้ไข
              </button>
              <button
                type="button"
                onClick={requestApprove}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all text-sm cursor-pointer"
              >
                ✓ ผ่านอนุมัติ
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
