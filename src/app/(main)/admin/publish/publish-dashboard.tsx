"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { CalendarClock, CalendarDays, Check, CheckCheck, ChevronLeft, ChevronRight, Copy, Download, ExternalLink, Filter, LayoutList, Loader2, MoreHorizontal, Search, Settings2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishModal, type PublishModalTab } from "./publish-modal";
import { PublishSlotsModal } from "@/components/publish/publish-slots-modal";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { usePublishItems, usePublishQueue, usePublishScheduleActions, usePublishSummary } from "@/features/clips/hooks/use-publish-schedules";
import { apiClient } from "@/lib/api-client";
import { buildClipCaption, driveDownloadUrl, PUBLISH_PLATFORMS } from "@/lib/publish-text";
import type { PaginatedData, User } from "@/types/api";

type TabId = "manage" | "calendar";
const SHORT_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const COLORS = ["bg-blue-100 text-blue-800", "bg-violet-100 text-violet-800", "bg-cyan-100 text-cyan-800", "bg-fuchsia-100 text-fuchsia-800", "bg-indigo-100 text-indigo-800", "bg-teal-100 text-teal-800"];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const downloadUrl = driveDownloadUrl;
const formatWhen = (value: string | Date) => new Date(value).toLocaleString("th-TH", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const optionsFetcher = async (url: string) => {
  const response = await apiClient.get<PaginatedData<User>>(url);
  if (response.status !== "success" || !response.data) throw new Error(response.message);
  return response.data;
};

function clipState(clip: any) {
  const posted = new Set<string>((clip.publishedPosts || []).map((p: any) => p.platform).filter(Boolean));
  const scheduledAt = clip.scheduledPublishAt ? new Date(clip.scheduledPublishAt) : null;
  const overdue = Boolean(scheduledAt && scheduledAt.getTime() < Date.now());
  if (posted.size >= 4) return { posted, scheduledAt, overdue, badge: { text: "โพสต์ครบแล้ว", tone: "bg-emerald-50 text-emerald-700" } };
  if (posted.size > 0) return { posted, scheduledAt, overdue, badge: { text: `โพสต์แล้ว ${posted.size}/4`, tone: "bg-amber-50 text-amber-700" } };
  if (!scheduledAt) return { posted, scheduledAt, overdue, badge: { text: "ยังไม่จัดคิว", tone: "bg-slate-100 text-slate-600" } };
  return { posted, scheduledAt, overdue, badge: overdue ? { text: "ถึงเวลาโพสต์แล้ว", tone: "bg-rose-50 text-rose-700" } : { text: "รอโพสต์ตามคิว", tone: "bg-violet-50 text-violet-700" } };
}

/**
 * One clip = one card. The whole daily job happens here: download, copy the
 * caption, then tap each platform once it is posted. The modal is only for
 * extras (back-dating, links, history, picking a date).
 */
function PublishRow({ clip, onOpen }: { clip: any; onOpen: (tab?: PublishModalTab) => void }) {
  const actions = usePublishScheduleActions();
  const source = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const { posted, scheduledAt, overdue, badge } = clipState(clip);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const remaining = PUBLISH_PLATFORMS.filter((p) => !posted.has(p.id)).map((p) => p.id);
  // A queue time that has passed is the best guess for when it went out.
  const postedAt = () => (scheduledAt && overdue ? scheduledAt : new Date()).toISOString();

  const mark = async (platforms: string[], key: string) => {
    setBusy(key);
    try {
      const when = postedAt();
      await actions.markPosted(clip.id, platforms, when, buildClipCaption(clip));
      toast.success(platforms.length > 1 ? `บันทึกโพสต์ครบ ${platforms.length} ช่องทาง` : `บันทึก ${PUBLISH_PLATFORMS.find((p) => p.id === platforms[0])?.label} แล้ว`, {
        description: `เวลาโพสต์ ${formatWhen(when)} · แก้เวลาได้ที่ "เพิ่มเติม"`,
      });
    } catch (error: any) {
      toast.error(error.message || "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const unmark = async (platform: string) => {
    const label = PUBLISH_PLATFORMS.find((p) => p.id === platform)?.label;
    if (!window.confirm(`ยกเลิกสถานะ "โพสต์แล้ว" ของ ${label}?`)) return;
    setBusy(platform);
    try {
      await actions.unmarkPosted(clip.id, platform);
      toast.success(`ยกเลิก ${label} แล้ว`);
    } catch (error: any) {
      toast.error(error.message || "ยกเลิกไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const queueNext = async () => {
    setBusy("queue");
    try {
      const suggestion = await actions.suggest(clip.id);
      await actions.saveQueue(clip.id, { scheduledAt: suggestion.scheduledAt, slotId: suggestion.slot.id });
      toast.success(`ลงคิว ${formatWhen(suggestion.scheduledAt)}`);
    } catch {
      // No weekly slot or no free day: let the admin pick a date.
      onOpen("schedule");
    } finally {
      setBusy(null);
    }
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(buildClipCaption(clip));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const urgent = overdue && posted.size < 4;

  return <article className={`rounded-2xl border bg-white p-4 shadow-xs ${urgent ? "border-rose-200" : "border-slate-200/80"}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${badge.tone}`}>{badge.text}</span>
          {scheduledAt ? (
            <button onClick={() => onOpen("schedule")} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold hover:bg-slate-100 ${urgent ? "text-rose-700" : "text-slate-600"}`} title="เปลี่ยนวันโพสต์">
              <CalendarClock className="h-3.5 w-3.5" />{formatWhen(scheduledAt)}
            </button>
          ) : posted.size < 4 && (
            <span className="flex items-center gap-1">
              <button onClick={queueNext} disabled={busy === "queue"} className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[12px] font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                {busy === "queue" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} ลงคิวถัดไป
              </button>
              <button onClick={() => onOpen("schedule")} className="h-7 rounded-lg px-2 text-[12px] font-bold text-blue-700 hover:bg-blue-50">เลือกวัน</button>
            </span>
          )}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug text-slate-900">{clip.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{clip.project?.name} · EP {clip.episode?.episodeNo || "-"} · {clip.owner?.displayName || "ไม่ระบุคนตัดต่อ"}</p>
      </div>
      <button onClick={() => onOpen()} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50" title="ย้อนเวลาโพสต์ ใส่ลิงก์ ดูประวัติ">
        <MoreHorizontal className="h-4 w-4" /><span className="hidden sm:inline">เพิ่มเติม</span>
      </button>
    </div>

    {/* Step 1: get the file and the text. */}
    <div className="mt-3 flex flex-wrap gap-2">
      {source ? <>
        <a href={downloadUrl(source)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"><Download className="h-3.5 w-3.5" /> ดาวน์โหลด</a>
        <a href={source} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><ExternalLink className="h-3.5 w-3.5" /> เปิดคลิป</a>
      </> : <span className="inline-flex h-9 items-center text-xs font-semibold text-rose-500">ยังไม่มีไฟล์ที่ผ่านการตรวจ</span>}
      <button onClick={copyCaption} className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold ${copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "คัดลอกแล้ว" : "คัดลอกแคปชั่น"}
      </button>
    </div>

    {/* Step 2: tick each platform once it is live. */}
    <div className="mt-3 rounded-xl bg-slate-50 p-2">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] font-bold text-slate-500">{posted.size >= 4 ? "โพสต์ครบทุกช่องทางแล้ว" : "โพสต์เสร็จแล้ว แตะช่องทางนั้นได้เลย"}</p>
        {remaining.length > 1 && <button onClick={() => mark(remaining, "all")} disabled={!!busy} className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50">
          {busy === "all" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />} ครบทุกช่องทาง
        </button>}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {PUBLISH_PLATFORMS.map((p) => {
          const done = posted.has(p.id);
          return <button key={p.id} onClick={() => done ? unmark(p.id) : mark([p.id], p.id)} disabled={!!busy} aria-pressed={done} title={done ? "แตะเพื่อยกเลิก" : "แตะเมื่อโพสต์แล้ว"}
            className={`group flex h-11 items-center gap-2 rounded-lg border px-2.5 text-left text-[13px] font-bold transition-colors disabled:cursor-wait ${done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 group-hover:border-blue-400"}`}>
              {busy === p.id || (busy === "all" && !done) ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" /> : done ? <><Check className="h-3 w-3 group-hover:hidden" strokeWidth={3} /><X className="hidden h-3 w-3 group-hover:block" strokeWidth={3} /></> : null}
            </span>
            {p.short}
          </button>;
        })}
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
  const [moreFilters, setMoreFilters] = useState(activeExtraFilters > 0);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [modalTab, setModalTab] = useState<PublishModalTab | undefined>();
  const { data: projects } = useProjects({ isActive: true });
  const { data: usersData } = useSWR<PaginatedData<User>>("/users?page=1&limit=100&isActive=true&role=USER&sortBy=displayName&sortOrder=asc", optionsFetcher);
  const { data: summary, isLoading: summaryLoading } = usePublishSummary();
  const { items, pagination, isLoading, error: itemsError } = usePublishItems({ page, limit, q: sp.get("q") || undefined, projectId: sp.get("projectId") || undefined, ownerId: sp.get("ownerId") || undefined, scheduleState: sp.get("scheduleState") || undefined, postingState: sp.get("postingState") || undefined, from: sp.get("from") || undefined, to: sp.get("to") || undefined, sortBy: "scheduledAt", sortOrder: "asc" });
  const update = (values: Record<string, string | undefined>, reset = true) => { const next = new URLSearchParams(sp.toString()); Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); if (reset) next.set("page", "1"); router.replace(`?${next.toString()}`, { scroll: false }); };
  useEffect(() => { const timer = setTimeout(() => { if (search !== (sp.get("q") || "")) update({ q: search || undefined }); }, 350); return () => clearTimeout(timer); }, [search]);
  const showStatus = (key: string) => key === "all" ? update({ scheduleState: undefined, postingState: undefined }) : key === "partial" || key === "completed" ? update({ postingState: key, scheduleState: undefined }) : update({ scheduleState: key, postingState: undefined });
  const reset = () => { setSearch(""); router.replace("?tab=manage"); };
  const selectToday = () => { const today = dateKey(new Date()); update({ from: today, to: today }); };
  const openClip = (clip: any, nextTab?: PublishModalTab) => { setModalTab(nextTab); setSelectedClip(clip); };
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageStart + index);

  const statuses = [
    { key: "all", label: "ทั้งหมด", count: undefined, hint: "" },
    { key: "overdue", label: "ถึงเวลาโพสต์", count: summary?.overdue, hint: "เลยเวลาคิวแล้ว ยังไม่ได้บันทึกว่าโพสต์" },
    { key: "unscheduled", label: "ยังไม่จัดคิว", count: summary?.unscheduled, hint: "ผ่านการตรวจแล้ว แต่ยังไม่มีวันโพสต์" },
    { key: "scheduled", label: "รอคิว", count: summary?.scheduled, hint: "มีวันโพสต์แล้ว" },
    { key: "partial", label: "โพสต์ไม่ครบ", count: summary?.partial, hint: "โพสต์ไปแล้วบางช่องทาง" },
    { key: "completed", label: "ครบแล้ว", count: summary?.completed, hint: "โพสต์ครบ 4 ช่องทาง" },
  ];
  const activeStatus = sp.get("scheduleState") || sp.get("postingState") || "all";

  return <div className="space-y-4 pb-12">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-black text-slate-900">เผยแพร่คลิป</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">ดาวน์โหลด → คัดลอกแคปชั่น → โพสต์ → แตะช่องทางที่โพสต์แล้ว</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button onClick={() => update({ tab: "manage" }, false)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${tab === "manage" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><LayoutList className="h-4 w-4" />รายการ</button>
          <button onClick={() => update({ tab: "calendar" }, false)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${tab === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><CalendarDays className="h-4 w-4" />ปฏิทิน</button>
        </div>
        <Button variant="outline" onClick={() => setSlotsOpen(true)} className="h-11 rounded-xl text-xs font-bold text-slate-700" title="ตั้งวันและเวลาโพสต์ประจำของแต่ละรายการ"><Settings2 className="mr-1.5 h-4 w-4" />รอบโพสต์</Button>
      </div>
    </header>

    {tab === "calendar" ? <CalendarView onOpen={(clip) => openClip(clip)} /> : <>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar" aria-label="สถานะการเผยแพร่">
        {statuses.map(({ key, label, count, hint }) => {
          const active = activeStatus === key;
          const alert = key === "overdue" && (count || 0) > 0;
          return <button key={key} onClick={() => showStatus(key)} title={hint} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors ${active ? "bg-slate-900 text-white" : alert ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200" : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"}`}>
            {label}{count !== undefined && <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-white/20" : alert ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}>{summaryLoading ? "–" : count ?? 0}</span>}
          </button>;
        })}
      </nav>

      <section className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อคลิป" className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-blue-500" /></label>
        <div className="flex gap-2">
          <select value={sp.get("projectId") || ""} onChange={(e) => update({ projectId: e.target.value || undefined })} className="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-sm outline-none ring-1 ring-inset ring-slate-200 sm:w-48 sm:flex-none"><option value="">ทุกรายการ</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <Button variant="ghost" onClick={() => setMoreFilters((v) => !v)} className={`h-10 shrink-0 rounded-xl font-bold ring-1 ring-inset ${moreFilters || activeExtraFilters ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-white text-slate-600 ring-slate-200"}`}><Filter className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">ตัวกรอง</span>{activeExtraFilters ? ` (${activeExtraFilters})` : ""}</Button>
        </div>
      </section>
      {moreFilters && <section className="grid gap-2 rounded-2xl bg-white p-3 ring-1 ring-inset ring-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <select value={sp.get("ownerId") || ""} onChange={(e) => update({ ownerId: e.target.value || undefined })} className="h-10 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200"><option value="">คนตัดต่อทั้งหมด</option>{(usersData?.items || []).map((u) => <option key={u.id} value={u.id}>{u.displayName}</option>)}</select>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">ตั้งแต่<input type="date" value={sp.get("from") || ""} onChange={(e) => update({ from: e.target.value || undefined })} className="h-10 flex-1 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /></label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">ถึง<input type="date" value={sp.get("to") || ""} onChange={(e) => update({ to: e.target.value || undefined })} className="h-10 flex-1 rounded-xl bg-slate-50 px-3 text-sm outline-none ring-1 ring-inset ring-slate-200" /></label>
        <div className="grid grid-cols-2 gap-2"><Button variant="ghost" onClick={selectToday} className="h-10 rounded-xl bg-blue-50 font-bold text-blue-700 hover:bg-blue-100">คิววันนี้</Button><Button variant="ghost" onClick={reset} className="h-10 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">ล้างทั้งหมด</Button></div>
      </section>}

      <section className="space-y-3">{itemsError ? <div className="rounded-3xl bg-rose-50 py-16 text-center text-sm font-bold text-rose-700">โหลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : isLoading ? <div className="flex justify-center rounded-3xl bg-white py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div> : items.length === 0 ? <div className="rounded-3xl bg-white py-16 text-center text-sm text-slate-500">{activeStatus === "overdue" ? "ไม่มีคลิปค้างโพสต์ 🎉" : "ไม่พบคลิปตามเงื่อนไข"}</div> : items.map((clip) => <PublishRow key={clip.id} clip={clip} onOpen={(nextTab) => openClip(clip, nextTab)} />)}</section>
      {pagination && totalPages > 1 && <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-slate-500">ทั้งหมด {pagination.total} รายการ · หน้า {pagination.page}/{totalPages}</span><div className="flex flex-wrap items-center gap-2"><select value={limit} onChange={(e) => update({ limit: e.target.value })} className="h-9 rounded-lg bg-slate-50 px-2 text-xs outline-none ring-1 ring-inset ring-slate-200"><option value="20">20 / หน้า</option><option value="50">50 / หน้า</option><option value="100">100 / หน้า</option></select><Button variant="ghost" size="sm" disabled={!pagination.hasPrevious} onClick={() => update({ page: String(page - 1) }, false)}><ChevronLeft className="h-4 w-4" /></Button>{pageNumbers.map((pageNumber) => <button key={pageNumber} onClick={() => update({ page: String(pageNumber) }, false)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{pageNumber}</button>)}<Button variant="ghost" size="sm" disabled={!pagination.hasNext} onClick={() => update({ page: String(page + 1) }, false)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
    <PublishSlotsModal open={slotsOpen} onOpenChange={setSlotsOpen} />{selectedClip && <PublishModal key={selectedClip.id} clip={selectedClip} initialTab={modalTab} isOpen={!!selectedClip} onClose={() => setSelectedClip(null)} />}
  </div>;
}
