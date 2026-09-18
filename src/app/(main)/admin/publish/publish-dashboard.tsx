"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, ExternalLink, Filter, LayoutList, Loader2, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishModal } from "./publish-modal";
import { PublishSlotsModal } from "@/components/publish/publish-slots-modal";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { usePublishItems, usePublishQueue, usePublishSummary } from "@/features/clips/hooks/use-publish-schedules";
import { apiClient } from "@/lib/api-client";
import type { PaginatedData, User } from "@/types/api";

type TabId = "manage" | "calendar";
const SHORT_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const COLORS = ["bg-blue-100 text-blue-800", "bg-violet-100 text-violet-800", "bg-cyan-100 text-cyan-800", "bg-fuchsia-100 text-fuchsia-800", "bg-indigo-100 text-indigo-800", "bg-teal-100 text-teal-800"];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const downloadUrl = (url: string) => { const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]; return id ? `https://drive.google.com/uc?export=download&id=${id}` : url; };

const optionsFetcher = async (url: string) => {
  const response = await apiClient.get<PaginatedData<User>>(url);
  if (response.status !== "success" || !response.data) throw new Error(response.message);
  return response.data;
};

function PublishRow({ clip, onOpen }: { clip: any; onOpen: () => void }) {
  const source = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const posted = clip.publishedPosts?.length || 0;
  return <article className="rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <button onClick={onOpen} className="min-w-0 text-left"><h3 className="truncate font-black text-slate-900 hover:text-blue-700">{clip.name}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{clip.project?.name} · EP {clip.episode?.episodeNo || "-"} · {clip.owner?.displayName || "ไม่ระบุคนตัดต่อ"}</p><p className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${clip.scheduledPublishAt ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}><CalendarClock className="h-3.5 w-3.5" />{clip.scheduledPublishAt ? new Date(clip.scheduledPublishAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : "ยังไม่จัดคิว"}</p></button>
      <div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-2.5 py-2 text-xs font-black ${posted >= 4 ? "bg-emerald-50 text-emerald-700" : posted > 0 ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-500"}`}>{posted}/4 แพลตฟอร์ม</span>{source && <><a href={source} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-bold text-blue-700"><ExternalLink className="h-3.5 w-3.5" /> เปิดคลิป</a><a href={downloadUrl(source)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white"><Download className="h-3.5 w-3.5" /> ดาวน์โหลด</a></>}<Button onClick={onOpen} className="h-9 rounded-lg bg-blue-600 text-xs font-bold">จัดการ</Button></div>
    </div>
  </article>;
}

function CalendarView({ onOpen }: { onOpen: (clip: any) => void }) {
  const router = useRouter(); const sp = useSearchParams();
  const today = new Date();
  const todayKey = dateKey(today);
  const raw = sp.get("month"); const initial = raw && /^\d{4}-\d{2}$/.test(raw) ? new Date(`${raw}-01T00:00:00`) : new Date();
  const month = new Date(initial.getFullYear(), initial.getMonth(), 1); const projectId = sp.get("projectId") || "";
  const { data: queue, isLoading, error } = usePublishQueue({ projectId: projectId || undefined, from: dateKey(month), to: dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0)) });
  const { data: projects } = useProjects({ isActive: true });
  const update = (values: Record<string, string | undefined>) => { const next = new URLSearchParams(sp.toString()); Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); next.set("tab", "calendar"); router.replace(`?${next.toString()}`, { scroll: false }); };
  const move = (delta: number) => { const next = new Date(month.getFullYear(), month.getMonth() + delta, 1); update({ month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}` }); };
  const goToday = () => update({ month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}` });
  const days = useMemo(() => { const cursor = new Date(month); cursor.setDate(cursor.getDate() - cursor.getDay()); return Array.from({ length: 42 }, (_, i) => { const day = new Date(cursor); day.setDate(cursor.getDate() + i); return day; }); }, [raw]);
  const byDate = useMemo(() => { const map = new Map<string, typeof queue>(); queue.forEach((item) => map.set(item.publishDate, [...(map.get(item.publishDate) || []), item])); return map; }, [queue]);
  const tones = useMemo(() => new Map(projects.map((p, i) => [p.id, COLORS[i % COLORS.length]])), [projects]);
  return <section className="rounded-3xl bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-black"><CalendarDays className="h-5 w-5 text-blue-600" /> ปฏิทินคิวเผยแพร่</h2><p className="mt-1 text-xs text-slate-500">ข้อมูลจาก API ครบทุกหน้า · {queue.length} คิวในเดือนนี้</p></div><div className="flex flex-wrap items-center gap-2"><select value={projectId} onChange={(e) => update({ projectId: e.target.value || undefined })} className="h-9 rounded-xl bg-slate-50 px-3 text-xs font-bold outline-none ring-1 ring-inset ring-slate-200"><option value="">ทุกรายการ</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Button variant="ghost" size="sm" onClick={goToday} className="bg-blue-50 font-bold text-blue-700 hover:bg-blue-100">วันนี้</Button><Button variant="ghost" size="sm" onClick={() => move(-1)}><ChevronLeft className="h-4 w-4" /></Button><span className="min-w-[130px] text-center text-sm font-black">{month.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</span><Button variant="ghost" size="sm" onClick={() => move(1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
    {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-10 text-center text-sm font-bold text-rose-700">โหลดคิวจาก API ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-100 p-px"><div className="grid min-w-[780px] grid-cols-7 gap-px">{SHORT_DAYS.map((d) => <div key={d} className="bg-slate-50 py-2 text-center text-[10px] font-black text-slate-500">{d}</div>)}{days.map((day) => { const key = dateKey(day); const isToday = key === todayKey; return <div key={key} className={`min-h-[108px] p-1.5 transition-colors ${isToday ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : day.getMonth() === month.getMonth() ? "bg-white" : "bg-slate-50/70"}`}><span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${isToday ? "bg-blue-600 text-white" : "text-slate-500"}`}>{day.getDate()}</span><div className="mt-1 space-y-1">{(byDate.get(key) || []).map((item) => { const count = item.clip?.publishedPosts?.length || 0; const tone = count >= 4 ? "bg-emerald-100 text-emerald-800" : count > 0 ? "bg-amber-100 text-amber-800" : tones.get(item.projectId) || COLORS[0]; return <button key={item.id} onClick={() => item.clip && onOpen(item.clip)} className={`block w-full truncate rounded-lg px-1.5 py-1 text-left text-[9px] font-black transition-transform hover:-translate-y-0.5 ${tone}`}>{item.publishTime.slice(0, 5)} {item.clip?.name}</button>; })}</div></div>; })}</div></div>}{isLoading && <div className="flex justify-center gap-2 py-5 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลดคิว...</div>}</section>;
}

export function PublishDashboard() {
  const router = useRouter(); const sp = useSearchParams();
  const tab: TabId = sp.get("tab") === "calendar" ? "calendar" : "manage";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = [20, 50, 100].includes(Number(sp.get("limit"))) ? Number(sp.get("limit")) : 20;
  const [search, setSearch] = useState(sp.get("q") || ""); const [slotsOpen, setSlotsOpen] = useState(false); const [selectedClip, setSelectedClip] = useState<any>(null);
  const { data: projects } = useProjects({ isActive: true });
  const { data: usersData } = useSWR<PaginatedData<User>>("/users?page=1&limit=100&isActive=true&role=USER&sortBy=displayName&sortOrder=asc", optionsFetcher);
  const { data: summary, isLoading: summaryLoading } = usePublishSummary();
  const { items, pagination, isLoading, error: itemsError } = usePublishItems({ page, limit, q: sp.get("q") || undefined, projectId: sp.get("projectId") || undefined, ownerId: sp.get("ownerId") || undefined, scheduleState: sp.get("scheduleState") || undefined, postingState: sp.get("postingState") || undefined, from: sp.get("from") || undefined, to: sp.get("to") || undefined, sortBy: "scheduledAt", sortOrder: "asc" });
  const update = (values: Record<string, string | undefined>, reset = true) => { const next = new URLSearchParams(sp.toString()); Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); if (reset) next.set("page", "1"); router.replace(`?${next.toString()}`, { scroll: false }); };
  useEffect(() => { const timer = setTimeout(() => { if (search !== (sp.get("q") || "")) update({ q: search || undefined }); }, 350); return () => clearTimeout(timer); }, [search]);
  const showSummary = (key: string) => key === "partial" || key === "completed" ? update({ postingState: key, scheduleState: undefined }) : update({ scheduleState: key, postingState: undefined });
  const reset = () => { setSearch(""); router.replace("?tab=manage"); };
  const selectToday = () => { const today = dateKey(new Date()); update({ from: today, to: today }); };
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageStart + index);

  return <div className="space-y-5 pb-12">
    <header className="rounded-3xl bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Share2 className="h-5 w-5" /></span><div><h1 className="text-lg font-black text-slate-900">จัดการการเผยแพร่คลิป</h1><p className="text-xs text-slate-500">จัดคิว ดาวน์โหลด และบันทึกสถานะโพสต์จากหน้าเดียว</p></div></div><div className="flex flex-col gap-2 sm:flex-row"><Button variant="ghost" onClick={() => setSlotsOpen(true)} className="rounded-xl bg-violet-50 font-bold text-violet-700 hover:bg-violet-100"><Clock3 className="mr-2 h-4 w-4" /> จัดการวันประจำรายการ</Button><div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => update({ tab: "manage" }, false)} className={`rounded-lg px-3 py-2 text-xs font-black ${tab === "manage" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}><LayoutList className="mr-1 inline h-4 w-4" />จัดการการเผยแพร่</button><button onClick={() => update({ tab: "calendar" }, false)} className={`rounded-lg px-3 py-2 text-xs font-black ${tab === "calendar" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}><CalendarDays className="mr-1 inline h-4 w-4" />ปฏิทินคิวเผยแพร่</button></div></div></div></header>

    {tab === "calendar" ? <CalendarView onOpen={setSelectedClip} /> : <>
      <section className="grid grid-cols-2 gap-2 lg:grid-cols-5">{[
        ["unscheduled", "ยังไม่จัดคิว", summary?.unscheduled, "bg-amber-50 text-amber-700"], ["scheduled", "จัดคิวแล้ว", summary?.scheduled, "bg-violet-50 text-violet-700"], ["overdue", "ถึงกำหนดยังไม่โพสต์", summary?.overdue, "bg-rose-50 text-rose-700"], ["partial", "โพสต์บางส่วน", summary?.partial, "bg-orange-50 text-orange-700"], ["completed", "โพสต์ครบ", summary?.completed, "bg-emerald-50 text-emerald-700"],
      ].map(([key, label, value, tone]) => <button key={String(key)} onClick={() => showSummary(String(key))} className={`rounded-2xl p-3 text-left shadow-sm transition-transform hover:-translate-y-0.5 ${tone}`}><p className="text-[10px] font-bold">{label}</p><p className="mt-1 text-2xl font-black">{summaryLoading ? "-" : value ?? 0}</p></button>)}</section>

      <section className="rounded-3xl bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2 font-black text-slate-800"><Filter className="h-4 w-4 text-blue-600" /> ตัวกรองจาก API</div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">กรองจากฐานข้อมูล</span></div><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อคลิป" className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-500" /></label>
        <select value={sp.get("projectId") || ""} onChange={(e) => update({ projectId: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">ทุกรายการ</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select value={sp.get("ownerId") || ""} onChange={(e) => update({ ownerId: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">คนตัดต่อทั้งหมด</option>{(usersData?.items || []).map((u) => <option key={u.id} value={u.id}>{u.displayName}</option>)}</select>
        <select value={sp.get("scheduleState") || ""} onChange={(e) => update({ scheduleState: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">ทุกสถานะคิว</option><option value="unscheduled">ยังไม่จัดคิว</option><option value="scheduled">จัดคิวแล้ว</option><option value="overdue">เลยกำหนด</option></select>
        <select value={sp.get("postingState") || ""} onChange={(e) => update({ postingState: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">ทุกสถานะโพสต์</option><option value="unposted">ยังไม่โพสต์</option><option value="partial">โพสต์บางส่วน</option><option value="completed">โพสต์ครบ</option></select>
        <input type="date" value={sp.get("from") || ""} onChange={(e) => update({ from: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /><input type="date" value={sp.get("to") || ""} onChange={(e) => update({ to: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /><div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={selectToday} className="rounded-xl bg-blue-50 font-bold text-blue-700 hover:bg-blue-100">วันนี้</Button><Button variant="ghost" onClick={reset} className="rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">ล้างตัวกรอง</Button></div>
      </div></section>

      <section className="space-y-3">{itemsError ? <div className="rounded-3xl bg-rose-50 py-16 text-center text-sm font-bold text-rose-700 shadow-sm">โหลดรายการจาก API ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : isLoading ? <div className="flex justify-center rounded-3xl bg-white py-20 text-slate-400 shadow-sm"><Loader2 className="h-6 w-6 animate-spin" /></div> : items.length === 0 ? <div className="rounded-3xl bg-white py-20 text-center text-sm text-slate-500 shadow-sm">ไม่พบคลิปตามเงื่อนไข</div> : items.map((clip) => <PublishRow key={clip.id} clip={clip} onOpen={() => setSelectedClip(clip)} />)}</section>
      {pagination && <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-slate-500">ทั้งหมด {pagination.total} รายการ · หน้า {pagination.page}/{totalPages}</span><div className="flex flex-wrap items-center gap-2"><select value={limit} onChange={(e) => update({ limit: e.target.value })} className="h-9 rounded-lg bg-slate-50 px-2 text-xs outline-none ring-1 ring-inset ring-slate-200"><option value="20">20 / หน้า</option><option value="50">50 / หน้า</option><option value="100">100 / หน้า</option></select><Button variant="ghost" size="sm" disabled={!pagination.hasPrevious} onClick={() => update({ page: String(page - 1) }, false)}><ChevronLeft className="h-4 w-4" /></Button>{pageNumbers.map((pageNumber) => <button key={pageNumber} onClick={() => update({ page: String(pageNumber) }, false)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{pageNumber}</button>)}<Button variant="ghost" size="sm" disabled={!pagination.hasNext} onClick={() => update({ page: String(page + 1) }, false)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
    <PublishSlotsModal open={slotsOpen} onOpenChange={setSlotsOpen} />{selectedClip && <PublishModal clip={selectedClip} isOpen={!!selectedClip} onClose={() => setSelectedClip(null)} />}
  </div>;
}
