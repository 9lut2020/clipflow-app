"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Mail, MessageCircle, Phone, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/features/profile/hooks/use-profile";
import type { User } from "@/types/api";

const PHONE_PATTERN = /^[0-9+\-\s()]{9,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Edit display name, phone and email. Used on the profile page and in the
 * first-login prompt. The LINE name is shown read-only for reference.
 */
export function ProfileForm({
  profile,
  onSaved,
  completeProfile = false,
  submitLabel = "บันทึก",
  secondaryAction,
}: {
  profile: User;
  onSaved?: (user: User) => void;
  completeProfile?: boolean;
  submitLabel?: string;
  secondaryAction?: React.ReactNode;
}) {
  const { update } = useSession();
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [email, setEmail] = useState(profile.email || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!displayName.trim()) next.displayName = "กรุณากรอกชื่อที่แสดง";
    else if (displayName.trim().length > 100) next.displayName = "ชื่อยาวเกิน 100 ตัวอักษร";
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) next.phone = "รูปแบบเบอร์โทรไม่ถูกต้อง";
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) next.email = "รูปแบบอีเมลไม่ถูกต้อง";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const res = await updateProfile(profile.id, {
        displayName: displayName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        ...(completeProfile && { completeProfile: true }),
      });
      if (res.status !== "success" || !res.data) throw new Error(res.message || "บันทึกไม่สำเร็จ");
      // Refresh the name shown in the top bar without signing in again.
      await update({ name: res.data.displayName }).catch(() => {});
      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      onSaved?.(res.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="profile-display-name" className="text-xs font-bold text-slate-500">
          ชื่อที่แสดงในระบบ <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <UserCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="profile-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            className={inputClass}
            placeholder="ชื่อที่ต้องการให้ทีมเห็น"
          />
        </div>
        {errors.displayName && <p className="text-xs text-rose-500">{errors.displayName}</p>}
      </div>

      {profile.lineDisplayName && (
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500">ชื่อใน LINE</span>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <MessageCircle size={18} className="text-[#06C755] shrink-0" />
            <span className="truncate">{profile.lineDisplayName}</span>
          </div>
          <p className="text-[11px] text-slate-400">อัปเดตอัตโนมัติจากบัญชี LINE ทุกครั้งที่เข้าสู่ระบบ</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="profile-phone" className="text-xs font-bold text-slate-500">
            เบอร์โทรศัพท์
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="08x-xxx-xxxx"
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-500">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="profile-email" className="text-xs font-bold text-slate-500">
            อีเมล
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
        </div>
      </div>
      <p className="text-[11px] text-slate-400">เบอร์โทรและอีเมลใช้สำหรับให้ผู้ดูแลติดต่อเท่านั้น</p>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        {secondaryAction}
        <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
          {isSaving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
