"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, ExternalLink, Filter, LayoutList, Loader2, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishModal, type PublishModalTab } from "./publish-modal";
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

function nextStep(clip: any) {
  const posted = clip.publishedPosts?.length || 0;
  const scheduledAt = clip.scheduledPublishAt ? new Date(clip.scheduledPublishAt) : null;
  if (posted >= 4) return { label: "ดูประวัติ", tone: "bg-slate-100 text-slate-700 hover:bg-slate-200", badge: { text: "โพสต์ครบแล้ว", tone: "bg-emerald-50 text-emerald-700" } };
  if (!scheduledAt) return { label: "จัดคิวโพสต์", tone: "bg-blue-600 text-white hover:bg-blue-700", badge: { text: "ยังไม่จัดคิว", tone: "bg-amber-50 text-amber-700" } };
  const overdue = scheduledAt.getTime() < Date.now();
  return {
    label: "บันทึกการโพสต์",
    tone: overdue ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-blue-600 text-white hover:bg-blue-700",
    badge: { text: overdue ? "ถึงกำหนดแล้ว" : "รอโพสต์ตามคิว", tone: overdue ? "bg-rose-50 text-rose-700" : "bg-violet-50 text-violet-700" },
  };
}

function PublishRow({ clip, onOpen }: { clip: any; onOpen: (tab?: PublishModalTab) => void }) {
  const source = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const posted = Math.min(4, clip.publishedPosts?.length || 0);
  const step = nextStep(clip);
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-shadow hover:shadow-md">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button onClick={() => onOpen()} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${step.badge.tone}`}>{step.badge.text}</span>
          {clip.scheduledPublishAt && <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600"><CalendarClock className="h-3.5 w-3.5" />{new Date(clip.scheduledPublishAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</span>}
        </div>
        <h3 className="mt-1.5 truncate font-bold text-slate-900 hover:text-blue-700">{clip.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{clip.project?.name} · EP {clip.episode?.episodeNo || "-"} · {clip.owner?.displayName || "ไม่ระบุคนตัดต่อ"}</p>
        <div className="mt-2 flex items-center gap-2" aria-label={`โพสต์แล้ว ${posted} จาก 4 แพลตฟอร์ม`}>
          <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 w-6 rounded-full ${i < posted ? "bg-emerald-500" : "bg-slate-200"}`} />)}</div>
          <span className="text-[11px] font-semibold text-slate-500">โพสต์แล้ว {posted}/4</span>
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-2">
        {source && <a href={downloadUrl(source)} target="_blank" rel="noreferrer" title="ดาวน์โหลดคลิป" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><Download className="h-4 w-4" /><span className="sr-only">ดาวน์โหลด</span></a>}
        {source && <a href={source} target="_blank" rel="noreferrer" title="เปิดคลิป" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"><ExternalLink className="h-4 w-4" /><span className="sr-only">เปิดคลิป</span></a>}
        {!clip.scheduledPublishAt && posted < 4 && <button onClick={() => onOpen("record")} title="โพสต์ไปแล้วแต่ยังไม่ได้บันทึก" className="h-10 rounded-xl border border-slate-200 px-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50">โพสต์ไปแล้ว</button>}
        <button onClick={() => onOpen()} className={`h-10 flex-1 rounded-xl px-4 text-[13px] font-bold sm:flex-none ${step.tone}`}>{step.label}</button>
      </div>
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
  const [search, setSearch] = useState(sp.get("q") || "");
  const activeExtraFilters = ["ownerId", "from", "to"].filter((key) => sp.get(key)).length;
  const [moreFilters, setMoreFilters] = useState(activeExtraFilters > 0); const [slotsOpen, setSlotsOpen] = useState(false); const [selectedClip, setSelectedClip] = useState<any>(null); const [modalTab, setModalTab] = useState<PublishModalTab | undefined>();
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

    {tab === "calendar" ? <CalendarView onOpen={(clip) => { setModalTab(undefined); setSelectedClip(clip); }} /> : <>
      {/* Status tabs: the main way to work through the queue. */}
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar" aria-label="สถานะการเผยแพร่">
        {([
          ["all", "ทั้งหมด", undefined],
          ["unscheduled", "ยังไม่จัดคิว", summary?.unscheduled],
          ["overdue", "ถึงกำหนดแล้ว", summary?.overdue],
          ["scheduled", "จัดคิวแล้ว", summary?.scheduled],
          ["partial", "โพสต์บางส่วน", summary?.partial],
          ["completed", "โพสต์ครบ", summary?.completed],
        ] as const).map(([key, label, count]) => {
          const active = key === "all" ? !sp.get("scheduleState") && !sp.get("postingState") : sp.get("scheduleState") === key || sp.get("postingState") === key;
          return <button key={key} onClick={() => key === "all" ? update({ scheduleState: undefined, postingState: undefined }) : showSummary(key)} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors ${active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"}`}>
            {label}{count !== undefined && <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-white/20" : key === "overdue" && (count || 0) > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{summaryLoading ? "–" : count ?? 0}</span>}
          </button>;
        })}
      </nav>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อคลิป" className="h-10 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-500" /></label>
          <select value={sp.get("projectId") || ""} onChange={(e) => update({ projectId: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200 sm:w-48"><option value="">ทุกรายการ</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <Button variant="ghost" onClick={() => setMoreFilters((v) => !v)} className={`h-10 rounded-xl font-bold ${moreFilters || activeExtraFilters ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-600"}`}><Filter className="mr-1.5 h-4 w-4" />ตัวกรองเพิ่มเติม{activeExtraFilters ? ` (${activeExtraFilters})` : ""}</Button>
        </div>
        {moreFilters && <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <select value={sp.get("ownerId") || ""} onChange={(e) => update({ ownerId: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">คนตัดต่อทั้งหมด</option>{(usersData?.items || []).map((u) => <option key={u.id} value={u.id}>{u.displayName}</option>)}</select>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">ตั้งแต่<input type="date" value={sp.get("from") || ""} onChange={(e) => update({ from: e.target.value || undefined })} className="h-10 flex-1 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /></label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">ถึง<input type="date" value={sp.get("to") || ""} onChange={(e) => update({ to: e.target.value || undefined })} className="h-10 flex-1 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /></label>
          <div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={selectToday} className="h-10 rounded-xl bg-blue-50 font-bold text-blue-700 hover:bg-blue-100">คิววันนี้</Button><Button variant="ghost" onClick={reset} className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">ล้างทั้งหมด</Button></div>
        </div>}
      </section>

      <section className="space-y-3">{itemsError ? <div className="rounded-3xl bg-rose-50 py-16 text-center text-sm font-bold text-rose-700 shadow-sm">โหลดรายการจาก API ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : isLoading ? <div className="flex justify-center rounded-3xl bg-white py-20 text-slate-400 shadow-sm"><Loader2 className="h-6 w-6 animate-spin" /></div> : items.length === 0 ? <div className="rounded-3xl bg-white py-20 text-center text-sm text-slate-500 shadow-sm">ไม่พบคลิปตามเงื่อนไข</div> : items.map((clip) => <PublishRow key={clip.id} clip={clip} onOpen={(nextTab) => { setModalTab(nextTab); setSelectedClip(clip); }} />)}</section>
      {pagination && <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-slate-500">ทั้งหมด {pagination.total} รายการ · หน้า {pagination.page}/{totalPages}</span><div className="flex flex-wrap items-center gap-2"><select value={limit} onChange={(e) => update({ limit: e.target.value })} className="h-9 rounded-lg bg-slate-50 px-2 text-xs outline-none ring-1 ring-inset ring-slate-200"><option value="20">20 / หน้า</option><option value="50">50 / หน้า</option><option value="100">100 / หน้า</option></select><Button variant="ghost" size="sm" disabled={!pagination.hasPrevious} onClick={() => update({ page: String(page - 1) }, false)}><ChevronLeft className="h-4 w-4" /></Button>{pageNumbers.map((pageNumber) => <button key={pageNumber} onClick={() => update({ page: String(pageNumber) }, false)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{pageNumber}</button>)}<Button variant="ghost" size="sm" disabled={!pagination.hasNext} onClick={() => update({ page: String(page + 1) }, false)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
    <PublishSlotsModal open={slotsOpen} onOpenChange={setSlotsOpen} />{selectedClip && <PublishModal key={selectedClip.id} clip={selectedClip} initialTab={modalTab} isOpen={!!selectedClip} onClose={() => setSelectedClip(null)} />}
  </div>;
}
