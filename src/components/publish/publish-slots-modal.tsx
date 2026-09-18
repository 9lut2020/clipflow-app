"use client";

import { useEffect, useState } from "react";
import { Clock3, Loader2, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { usePublishScheduleActions, usePublishSlots, type ProjectPublishSlot } from "@/features/clips/hooks/use-publish-schedules";

const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export function PublishSlotsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [publishTime, setPublishTime] = useState("19:00");
  const [editing, setEditing] = useState<ProjectPublishSlot | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: projects } = useProjects({ isActive: true });
  const { data: slots, pagination, isLoading } = usePublishSlots({ projectId: projectFilter || undefined, q: q || undefined, dayOfWeek: dayFilter === "" ? undefined : Number(dayFilter), isActive: activeFilter === "" ? undefined : activeFilter === "true", page, limit: 20 });
  const actions = usePublishScheduleActions();

  useEffect(() => setPage(1), [q, projectFilter, dayFilter, activeFilter]);

  const resetForm = () => { setEditing(null); setProjectId(""); setDayOfWeek(1); setPublishTime("19:00"); };
  const beginEdit = (slot: ProjectPublishSlot) => { setEditing(slot); setProjectId(slot.projectId); setDayOfWeek(slot.dayOfWeek); setPublishTime(slot.publishTime.slice(0, 5)); };
  const save = async () => {
    if (!projectId) return toast.error("กรุณาเลือกรายการ");
    setBusy(true);
    try {
      if (editing) await actions.updateSlot(editing.id, { dayOfWeek, publishTime });
      else await actions.createSlot({ projectId, dayOfWeek, publishTime });
      toast.success(editing ? "แก้ไขวันประจำแล้ว" : "เพิ่มวันประจำแล้ว");
      resetForm();
    } catch (error: any) { toast.error(error.message || "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 sm:rounded-3xl">
        <DialogHeader className="border-b border-slate-100 bg-slate-50 px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-black"><Clock3 className="h-5 w-5 text-violet-600" /> วันและเวลาประจำของแต่ละรายการ</DialogTitle>
          <DialogDescription>กำหนด slot รายสัปดาห์สำหรับให้ระบบแนะนำคิวถัดไป · เวลา Asia/Bangkok</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[78vh] overflow-y-auto lg:grid-cols-[320px_1fr]">
          <section className="border-b border-slate-100 bg-violet-50/40 p-5 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-black text-slate-900">{editing ? "แก้ไขวันประจำ" : "เพิ่มวันประจำ"}</h3>{editing && <button onClick={resetForm} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}</div>
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">รายการ<select value={projectId} disabled={!!editing} onChange={(e) => setProjectId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">เลือกรายการ</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-600">วัน<select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-600">เวลา<input type="time" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
              <Button onClick={save} disabled={busy || !projectId} className="w-full rounded-xl bg-violet-600 font-bold hover:bg-violet-700">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}{editing ? "บันทึกการแก้ไข" : "เพิ่มวันและเวลา"}</Button>
            </div>
          </section>
          <section className="p-5">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อรายการ" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">ทุกรายการ</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
              <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">ทุกวัน</option>{DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</select>
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">ทุกสถานะ</option><option value="true">เปิดใช้งาน</option><option value="false">ปิดใช้งาน</option></select>
            </div>
            <div className="mt-4 space-y-2">
              {isLoading ? <div className="py-12 text-center text-sm text-slate-400">กำลังโหลด...</div> : slots.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">ยังไม่มีวันประจำตามเงื่อนไขนี้</div> : slots.map((slot) => (
                <div key={slot.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-black text-slate-800">{slot.project?.name}</p><p className="mt-1 text-xs font-bold text-violet-700">{DAYS[slot.dayOfWeek]} · {slot.publishTime.slice(0, 5)} น. <span className="ml-2 text-slate-400">Asia/Bangkok</span></p></div>
                  <div className="flex items-center gap-1"><button title="แก้ไข" onClick={() => beginEdit(slot)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button><button title={slot.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} onClick={() => actions.updateSlot(slot.id, { isActive: !slot.isActive })} className={`rounded-lg p-2 ${slot.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}><Power className="h-4 w-4" /></button><button title="ลบ" onClick={() => { if (window.confirm(`ลบวันประจำ ${DAYS[slot.dayOfWeek]} ของ ${slot.project?.name} ใช่ไหม?`)) void actions.deleteSlot(slot.id); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">ทั้งหมด {pagination.total} รายการ</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!pagination.hasPrevious} onClick={() => setPage((value) => value - 1)}>ก่อนหน้า</Button><span className="px-2 py-2 text-xs font-bold">{pagination.page}/{pagination.totalPages}</span><Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((value) => value + 1)}>ถัดไป</Button></div></div>}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
