"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

type Member = { id: string; displayName: string; pictureUrl?: string | null; role?: string; projectRole?: string };

/**
 * Shown to admins on a clip that nobody has been given yet ("รอมอบหมาย"):
 * pick one of the project's members and the clip is assigned (and the
 * editor notified on LINE) without going through the assignment sheet.
 */
export function AssignOwnerCard({ clipId, projectId, onAssigned }: { clipId: string; projectId: string; onAssigned?: (owner: Member) => void }) {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: members = [], isLoading } = useSWR<Member[]>(
    `/projects/${projectId}/members?page=1&limit=100&isActive=true`,
    async (url: string) => {
      const res = await apiClient.get<{ items: Member[] }>(url);
      if (res.status !== "success") throw new Error(res.message);
      // Reviewers of this project only review; assign to its editors.
      return (res.data?.items || []).filter((m) => m.projectRole !== "REVIEWER");
    },
  );

  const assign = async () => {
    if (!ownerId) return;
    setSaving(true);
    try {
      const res = await apiClient.patch<any>(`/clips/${clipId}/owner`, { ownerId });
      if (res.status !== "success") throw new Error(res.message);
      const owner = members.find((m) => m.id === ownerId)!;
      toast.success(`มอบหมายให้ ${owner?.displayName || "สมาชิก"} แล้ว`, { description: "ระบบแจ้งเตือนผู้รับงานทาง LINE ให้แล้ว" });
      onAssigned?.(owner);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "มอบหมายไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-dashed border-violet-300 bg-violet-50/60 p-4 sm:mb-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><UserPlus className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-black text-slate-800">คลิปนี้ยังไม่มีผู้รับผิดชอบ</p>
          <p className="text-xs text-slate-500">เลือกสมาชิกในโปรเจกต์เพื่อมอบหมายงาน</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          disabled={isLoading || saving}
          className="h-10 flex-1 rounded-xl border border-violet-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="">{isLoading ? "กำลังโหลดสมาชิก..." : members.length ? "เลือกคนตัดต่อ..." : "โปรเจกต์นี้ยังไม่มีสมาชิก"}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName}{m.role && m.role !== "USER" ? ` (${m.role})` : ""}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={assign}
          disabled={!ownerId || saving}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} มอบหมาย
        </button>
      </div>
    </div>
  );
}
