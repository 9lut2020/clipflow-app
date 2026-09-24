"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePublishScheduleActions, usePublishSlots } from "@/features/clips/hooks/use-publish-schedules";

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ScheduleEditor({ clip, onSaved }: { clip: any; onSaved?: () => void }) {
  const actions = usePublishScheduleActions();
  const { data: slots } = usePublishSlots({ projectId: clip.project?.id, isActive: true, limit: 20 });
  const [value, setValue] = useState(toLocalInput(clip.scheduledPublishAt));
  const [slotId, setSlotId] = useState<string | null>(clip.publishSchedule?.slotId || null);
  const [note, setNote] = useState(clip.publishSchedule?.note || "");
  const [hasSavedSchedule, setHasSavedSchedule] = useState(Boolean(clip.scheduledPublishAt));
  const [isBusy, setIsBusy] = useState(false);
  const [conflict, setConflict] = useState<any | null>(null);

  useEffect(() => {
    setValue(toLocalInput(clip.scheduledPublishAt));
    setSlotId(clip.publishSchedule?.slotId || null);
    setNote(clip.publishSchedule?.note || "");
    setHasSavedSchedule(Boolean(clip.scheduledPublishAt));
    setConflict(null);
  }, [clip.id, clip.scheduledPublishAt, clip.publishSchedule?.slotId, clip.publishSchedule?.note]);

  const suggest = async () => {
    setIsBusy(true);
    try {
      const result = await actions.suggest(clip.id);
      setValue(toLocalInput(result.scheduledAt));
      setSlotId(result.slot.id);
      toast.success(`แนะนำ ${new Date(result.scheduledAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const save = async (allowSameDay = false) => {
    if (!slotId) return toast.error("Please select a project publishing slot");
    setIsBusy(true);
    setConflict(null);
    try {
      const saved = await actions.saveQueue(clip.id, {
        scheduledAt: value ? new Date(value).toISOString() : new Date().toISOString(),
        slotId,
        allowSameDay,
        note,
      });
      setHasSavedSchedule(true);
      if (saved?.publishDate && saved?.publishTime) setValue(`${saved.publishDate}T${String(saved.publishTime).slice(0, 5)}`);
      toast.success("บันทึกคิวเผยแพร่แล้ว");
      onSaved?.();
    } catch (error: any) {
      if (error.code === "SCHEDULE_CONFLICT") setConflict(error.data?.conflict || {});
      else toast.error(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm("ยกเลิกคิวเผยแพร่ของคลิปนี้ใช่ไหม?")) return;
    setIsBusy(true);
    try {
      await actions.cancelQueue(clip.id);
      setValue("");
      setSlotId(null);
      setHasSavedSchedule(false);
      toast.success("ยกเลิกคิวแล้ว");
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-800">คิวเผยแพร่</h3>
            <p className="text-[11px] font-medium text-slate-500">อิงวันและเวลาประจำของรายการ {clip.project?.name || ""}</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={suggest} disabled={isBusy} className="h-8 rounded-lg border-violet-200 bg-white text-xs font-bold text-violet-700">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> แนะนำคิวถัดไป
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select value={slotId || ""} onChange={(event) => { setSlotId(event.target.value || null); setConflict(null); }} className="h-10 rounded-lg border border-violet-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
          <option value="">Select an active project slot</option>
          {slots.map((slot) => <option key={slot.id} value={slot.id}>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][slot.dayOfWeek]} {String(slot.publishTime).slice(0, 5)}</option>)}
        </select>
        <Button type="button" onClick={() => save(false)} disabled={isBusy || !slotId} className="h-10 rounded-lg bg-violet-600 px-5 text-xs font-bold text-white hover:bg-violet-700">
          {isBusy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} บันทึกคิว
        </Button>
      </div>

      <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="หมายเหตุคิว (ถ้ามี)" className="h-9 w-full rounded-lg border border-violet-100 bg-white px-3 text-xs text-slate-700 outline-none focus:border-violet-400" />

      {conflict && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2 text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black">รายการนี้มีคลิปในวันดังกล่าวแล้ว</p>
              <p className="mt-0.5 text-[11px]">{conflict.clip?.name || "มีคิวอื่นอยู่แล้ว"}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setConflict(null)} className="h-8 text-xs">เลือกวันอื่น</Button>
            <Button type="button" size="sm" onClick={() => save(true)} className="h-8 bg-amber-600 text-xs hover:bg-amber-700">ยืนยันลงซ้ำ</Button>
          </div>
        </div>
      )}

      {hasSavedSchedule && value && (
        <div className="flex items-center justify-between gap-2 border-t border-violet-100 pt-2">
          <p className="text-xs font-bold text-violet-700">กำหนดไว้ {new Date(value).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p>
          <Button type="button" variant="ghost" size="sm" onClick={cancel} disabled={isBusy} className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="mr-1 h-3.5 w-3.5" /> ยกเลิกคิว</Button>
        </div>
      )}
    </section>
  );
}
