"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { usePublishQueue, usePublishScheduleActions, usePublishSlots } from "@/features/clips/hooks/use-publish-schedules";
import { toast } from "sonner";

const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const SHORT_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const PROJECT_COLORS = [
  "bg-blue-50 text-blue-700 hover:bg-blue-100",
  "bg-violet-50 text-violet-700 hover:bg-violet-100",
  "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100",
  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  "bg-teal-50 text-teal-700 hover:bg-teal-100",
];

const dateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function PublishPlanner({ clips, onSelectClip }: { clips: any[]; onSelectClip: (clip: any) => void }) {
  const { data: projects } = useProjects();
  const { data: slots, isLoading: slotsLoading } = usePublishSlots();
  const { data: queue, isLoading: queueLoading } = usePublishQueue();
  const actions = usePublishScheduleActions();
  const [projectId, setProjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [publishTime, setPublishTime] = useState("19:00");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [busy, setBusy] = useState(false);
  const [previews, setPreviews] = useState<any[]>([]);
  const [skippedPreviews, setSkippedPreviews] = useState<Array<{ clipId: string; reason: string }>>([]);

  const projectColors = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((project, index) => map.set(project.id, PROJECT_COLORS[index % PROJECT_COLORS.length]));
    return map;
  }, [projects]);

  const slotsByProject = useMemo(() => {
    const map = new Map<string, typeof slots>();
    slots.forEach((slot) => map.set(slot.projectId, [...(map.get(slot.projectId) || []), slot]));
    return map;
  }, [slots]);

  const calendarDays = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() - cursor.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(cursor);
      day.setDate(cursor.getDate() + index);
      return day;
    });
  }, [month]);

  const queueByDate = useMemo(() => {
    const map = new Map<string, typeof queue>();
    queue.forEach((item) => map.set(item.publishDate, [...(map.get(item.publishDate) || []), item]));
    return map;
  }, [queue]);

  const createSlot = async () => {
    if (!projectId) return toast.error("กรุณาเลือกรายการ");
    setBusy(true);
    try {
      await actions.createSlot({ projectId, dayOfWeek, publishTime });
      toast.success("เพิ่มวันประจำรายการแล้ว");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const buildPreview = async () => {
    const unscheduled = clips.filter((clip) => !clip.scheduledPublishAt);
    if (!unscheduled.length) return toast.info("ทุกคลิปมีคิวแล้ว");
    setBusy(true);
    try {
      const result = await actions.suggestBulk(unscheduled.map((clip) => clip.id));
      const suggestions = Array.isArray(result) ? result : result.suggestions || [];
      const skipped = Array.isArray(result) ? [] : result.skipped || [];
      setPreviews(suggestions);
      setSkippedPreviews(skipped);
      if (skipped.length) toast.warning(`ข้าม ${skipped.length} คลิป เพราะรายการยังไม่มีวันประจำหรือไม่มีคิวว่าง`);
      if (!suggestions.length) toast.info("ยังไม่มีคลิปที่จัดคิวอัตโนมัติได้");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmPreview = async () => {
    setBusy(true);
    try {
      for (const preview of previews) {
        await actions.saveQueue(preview.clip.id, { scheduledAt: preview.scheduledAt, slotId: preview.slot.id });
      }
      setPreviews([]);
      setSkippedPreviews([]);
      toast.success("จัดคิวตามวันประจำรายการแล้ว");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900"><Clock3 className="h-5 w-5 text-violet-600" /> วันและเวลาประจำของแต่ละรายการ</h2>
            <p className="mt-1 text-xs text-slate-500">ระบบใช้ตารางนี้เพื่อแนะนำคิวถัดไปของคลิปแต่ละรายการ</p>
          </div>
          <Button type="button" onClick={buildPreview} disabled={busy} className="rounded-xl bg-violet-600 text-xs font-bold hover:bg-violet-700">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} จัดคิวคลิปที่ยังไม่มีวัน
          </Button>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_140px_130px_auto]">
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <option value="">เลือกรายการ</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <select value={dayOfWeek} onChange={(event) => setDayOfWeek(Number(event.target.value))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            {DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
          </select>
          <input type="time" value={publishTime} onChange={(event) => setPublishTime(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" />
          <Button type="button" onClick={createSlot} disabled={busy || !projectId} className="h-10 rounded-lg bg-blue-600 text-xs font-bold hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" /> เพิ่มวัน</Button>
        </div>

        <div className="mt-4 space-y-2">
          {slotsLoading ? <p className="py-6 text-center text-xs text-slate-400">กำลังโหลดวันประจำ...</p> : projects.map((project) => {
            const projectSlots = slotsByProject.get(project.id) || [];
            return (
              <div key={project.id} className="grid gap-3 rounded-xl border border-slate-100 px-3 py-3 sm:grid-cols-[minmax(160px,1fr)_2fr] sm:items-center">
                <div className="font-bold text-slate-800">{project.name}</div>
                <div className="flex flex-wrap gap-2">
                  {projectSlots.length ? projectSlots.map((slot) => (
                    <div key={slot.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${slot.isActive ? "border-violet-200 bg-violet-50 text-violet-800" : "border-slate-200 bg-slate-100 text-slate-400"}`}>
                      <button type="button" onClick={() => actions.updateSlot(slot.id, { isActive: !slot.isActive })} className="font-black">{DAYS[slot.dayOfWeek]}</button>
                      <input type="time" defaultValue={slot.publishTime.slice(0, 5)} onBlur={(event) => actions.updateSlot(slot.id, { publishTime: event.target.value })} className="w-[82px] rounded border border-white/80 bg-white px-1.5 py-1 font-bold text-slate-700" />
                      <button type="button" onClick={() => { if (window.confirm("ลบวันประจำนี้ใช่ไหม?")) void actions.deleteSlot(slot.id); }} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )) : <span className="text-xs font-semibold text-amber-600">ยังไม่ได้ตั้งวันประจำ</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {(previews.length > 0 || skippedPreviews.length > 0) && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-xs">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div><h3 className="font-black text-blue-900">ตัวอย่างคิวที่ระบบแนะนำ ({previews.length} คลิป)</h3><p className="text-xs text-blue-700">ตรวจสอบก่อนยืนยัน ระบบยังไม่ได้บันทึกคิว</p></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => { setPreviews([]); setSkippedPreviews([]); }} className="h-9 bg-white text-xs">ยกเลิก</Button>{previews.length > 0 && <Button onClick={confirmPreview} disabled={busy} className="h-9 bg-blue-600 text-xs font-bold">ยืนยันทั้งหมด</Button>}</div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{previews.map((item) => <div key={item.clip.id} className="rounded-xl bg-white p-3 text-xs shadow-xs"><p className="truncate font-black text-slate-800">{item.clip.name}</p><p className="mt-1 font-semibold text-blue-700">{new Date(item.scheduledAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</p></div>)}</div>
          {skippedPreviews.length > 0 && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">ข้าม {skippedPreviews.length} คลิป: {Array.from(new Set(skippedPreviews.map((item) => item.reason))).join(" • ")}</div>}
        </section>
      )}

      <section id="calendar" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-base font-black text-slate-900"><CalendarDays className="h-5 w-5 text-blue-600" /> ปฏิทินคิวเผยแพร่</h2><p className="mt-1 text-xs text-slate-500">คลิกคลิปเพื่อเปิดและแก้ไขคิว</p></div>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button><span className="min-w-[120px] text-center text-sm font-black text-slate-800">{month.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</span><Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {projects.slice(0, 8).map((project) => <span key={project.id} className={`rounded-full px-2 py-1 text-[10px] font-bold ${projectColors.get(project.id)}`}>{project.name}</span>)}
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">โพสต์บางส่วน</span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">โพสต์ครบ</span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <div className="grid min-w-[760px] grid-cols-7 overflow-hidden">
          {SHORT_DAYS.map((day) => <div key={day} className="border-b border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-black text-slate-500">{day}</div>)}
          {calendarDays.map((day) => {
            const key = dateKey(day);
            const items = queueByDate.get(key) || [];
            const inMonth = day.getMonth() === month.getMonth();
            return <div key={key} className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 ${inMonth ? "bg-white" : "bg-slate-50/70"}`}><span className={`text-[10px] font-bold ${inMonth ? "text-slate-600" : "text-slate-300"}`}>{day.getDate()}</span><div className="mt-1 space-y-1">{items.slice(0, 3).map((item) => { const postedCount = item.clip?.publishedPosts?.length || 0; const itemColor = postedCount >= 4 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : postedCount > 0 ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : projectColors.get(item.projectId) || PROJECT_COLORS[0]; return <button key={item.id} type="button" title={`${item.project?.name || ""} — ${item.clip?.name || ""}`} onClick={() => { const clip = clips.find((value) => value.id === item.clipId) || item.clip; if (clip) onSelectClip(clip); }} className={`block w-full truncate rounded px-1.5 py-1 text-left text-[9px] font-bold ${itemColor}`}>{item.publishTime.slice(0, 5)} {item.clip?.name}</button>; })}{items.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{items.length - 3} คลิป</span>}</div></div>;
          })}
        </div>
        </div>
        {queueLoading && <p className="mt-3 text-center text-xs text-slate-400">กำลังโหลดปฏิทิน...</p>}
      </section>
    </div>
  );
}
