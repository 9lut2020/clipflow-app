"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export type ReviewConfirmAction = "APPROVE" | "REJECT" | "RESUBMIT";

interface ReviewConfirmModalProps {
  action: ReviewConfirmAction;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const modalMeta: Record<
  ReviewConfirmAction,
  {
    title: string;
    desc: string;
    confirmText: string;
    confirmClass: string;
    icon: typeof CheckCircle;
    iconClass: string;
  }
> = {
  APPROVE: {
    title: "ยืนยันการให้ผ่าน?",
    desc:
      "คุณแน่ใจหรือไม่ว่าต้องการให้ผ่านคลิปนี้? เมื่อยืนยันแล้วคลิปนี้จะเข้าสู่สถานะ 'ผ่าน'",
    confirmText: "ยืนยันให้ผ่าน",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    icon: CheckCircle,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  REJECT: {
    title: "ยืนยันการตีกลับ?",
    desc:
      "คุณต้องการตีกลับเพื่อให้แก้ไขชิ้นงานใช่หรือไม่? ระบบจะส่งข้อเสนอแนะของคุณไปให้ผู้ทำคลิป",
    confirmText: "ยืนยันตีกลับ",
    confirmClass: "bg-rose-600 hover:bg-rose-700 text-white",
    icon: XCircle,
    iconClass: "bg-rose-100 text-rose-600",
  },
  RESUBMIT: {
    title: "ยืนยันการส่งงาน?",
    desc: "คุณต้องการส่งงานแก้ไขนี้ไปให้ผู้ตรวจใช่หรือไม่?",
    confirmText: "ยืนยันส่งงาน",
    confirmClass: "bg-rose-600 hover:bg-rose-700 text-white",
    icon: CheckCircle,
    iconClass: "bg-blue-100 text-blue-600",
  },
};

export default function ReviewConfirmModal({
  action,
  isLoading,
  onCancel,
  onConfirm,
}: ReviewConfirmModalProps) {
  const meta = modalMeta[action];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel()}
      />
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${meta.iconClass}`}
          >
            <Icon size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {meta.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">{meta.desc}</p>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${meta.confirmClass} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              meta.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
