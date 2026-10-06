"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfileForm } from "./profile-form";

// "Later" hides the prompt for a day, then it asks again while details are missing.
const SNOOZE_MS = 24 * 60 * 60 * 1000;
const snoozeKey = (userId: string) => `clipflow:profile-prompt-snoozed:${userId}`;

function isSnoozed(userId: string) {
  try {
    const value = Number(localStorage.getItem(snoozeKey(userId)) || 0);
    return Date.now() - value < SNOOZE_MS;
  } catch {
    return false;
  }
}

/**
 * Asks on first login (and while phone/email are missing) for a display name
 * and contact details. Can be postponed with "ไว้ทีหลัง".
 */
export function ProfileOnboarding() {
  const { data: session } = useSession();
  const userId = session?.user?.isBypass ? undefined : session?.user?.id;
  const { profile, mutate } = useProfile(userId);
  const [open, setOpen] = useState(false);

  const isFirstTime = Boolean(profile && !profile.profileCompletedAt);
  const missingContact = Boolean(profile && (!profile.phone || !profile.email));

  useEffect(() => {
    if (!profile || !userId) return;
    if ((isFirstTime || missingContact) && !isSnoozed(userId)) setOpen(true);
  }, [profile, userId, isFirstTime, missingContact]);

  if (!profile || !userId) return null;

  const snooze = () => {
    try {
      localStorage.setItem(snoozeKey(userId), String(Date.now()));
    } catch {
      // Storage unavailable (private mode): the prompt simply returns next load.
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : snooze())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isFirstTime ? "ยินดีต้อนรับสู่ ClipFlow 👋" : "กรอกข้อมูลติดต่อ"}</DialogTitle>
          <DialogDescription>
            {isFirstTime
              ? "ตั้งชื่อที่ต้องการให้ทีมเห็น และกรอกเบอร์โทร/อีเมลไว้สำหรับติดต่อ"
              : "บัญชีของคุณยังไม่มีเบอร์โทรหรืออีเมล กรอกไว้เพื่อให้ผู้ดูแลติดต่อได้"}
          </DialogDescription>
        </DialogHeader>
        <ProfileForm
          profile={profile}
          completeProfile
          submitLabel="บันทึกข้อมูล"
          onSaved={(user) => {
            mutate({ status: "success", message: "", data: user } as never, { revalidate: false });
            setOpen(false);
          }}
          secondaryAction={
            <Button type="button" variant="ghost" onClick={snooze} className="text-slate-500">
              ไว้ทีหลัง
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
