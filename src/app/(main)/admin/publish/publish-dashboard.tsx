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
import { usePostedByDate, usePublishItems, usePublishQueue, usePublishScheduleActions, usePublishSummary } from "@/features/clips/hooks/use-publish-schedules";
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
  const done = posted.size >= 4;
  const overdue = Boolean(!done && scheduledAt && scheduledAt.getTime() < Date.now());
  return { posted, scheduledAt, done, overdue };
}

/**
 * One clip = one card, one main button. Download → copy caption → post →
 * press "โพสต์ครบแล้ว". Anything unusual (only some platforms, a past date,
 * a queue date, the post link) lives behind "รายละเอียด".
 */
function PublishRow({ clip, onOpen }: { clip: any; onOpen: (tab?: PublishModalTab) => void }) {
  const actions = usePublishScheduleActions();
  const source = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const { posted, scheduledAt, done, overdue } = clipState(clip);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const remaining = PUBLISH_PLATFORMS.filter((p) => !posted.has(p.id)).map((p) => p.id);

  const markAll = async () => {
    setBusy(true);
    // A queue time that has passed is the best guess for when it went out.
    const when = (overdue && scheduledAt ? scheduledAt : new Date()).toISOString();
    const marked = [...remaining];
    try {
      await actions.markPosted(clip.id, marked, when, buildClipCaption(clip));
      toast.success("บันทึกแล้ว: โพสต์ครบทุกช่องทาง", {
        description: `${clip.name} · ย้ายไปแท็บ "โพสต์แล้ว"`,
        action: {
          label: "เลิกทำ",
          onClick: async () => {
            try {
              for (const platform of marked) await actions.unmarkPosted(clip.id, platform);
              toast.success("เลิกทำแล้ว");
            } catch (error: any) {
              toast.error(error.message || "เลิกทำไม่สำเร็จ");
            }
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message || "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(buildClipCaption(clip));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return <article className={`rounded-2xl border bg-white p-4 shadow-xs ${overdue ? "border-rose-200" : done ? "border-emerald-200" : "border-slate-200/80"}`}>
    <div className="flex items-start justify-between gap-3">
      <button onClick={() => onOpen()} className="min-w-0 flex-1 text-left">
        <h3 className="line-clamp-2 font-bold leading-snug text-slate-900 hover:text-blue-700">{clip.name}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{clip.project?.name} · EP {clip.episode?.episodeNo || "-"} · {clip.owner?.displayName || "ไม่ระบุคนตัดต่อ"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold">
          {done ? (
            <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCheck className="h-3.5 w-3.5" /> โพสต์ครบทุกช่องทางแล้ว</span>
          ) : posted.size > 0 ? (
            <span className="text-amber-700">โพสต์แล้ว {posted.size}/4 ช่องทาง</span>
          ) : (
            <span className="text-slate-500">ยังไม่ได้โพสต์</span>
          )}
          {scheduledAt && !done && (
            <span className={`inline-flex items-center gap-1 ${overdue ? "text-rose-700" : "text-slate-500"}`}>
              <CalendarClock className="h-3.5 w-3.5" />{overdue ? "ถึงเวลาแล้ว · " : "คิว "}{formatWhen(scheduledAt)}
            </span>
          )}
        </div>
        {/* Which platforms already have it — read-only, details in the modal. */}
        <div className="mt-2 flex flex-wrap gap-1">
          {PUBLISH_PLATFORMS.map((p) => (
            <span key={p.id} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${posted.has(p.id) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              {posted.has(p.id) && <Check className="h-3 w-3" strokeWidth={3} />}{p.short}
            </span>
          ))}
        </div>
      </button>
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-2">
      {source ? (
        <a href={downloadUrl(source)} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> ดาวน์โหลด</a>
      ) : (
        <span className="text-xs font-semibold text-rose-500">ยังไม่มีไฟล์ที่ผ่านการตรวจ</span>
      )}
      <button onClick={copyCaption} className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold ${copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "คัดลอกแล้ว" : "คัดลอกแคปชั่น"}
      </button>
      <button onClick={() => onOpen()} className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800">
        <MoreHorizontal className="h-4 w-4" /> รายละเอียด
      </button>
      {!done && (
        <button onClick={markAll} disabled={busy} className={`ml-auto inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-60 sm:flex-none ${overdue ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />} โพสต์ครบแล้ว
        </button>
      )}
    </div>
  </article>;
}

type CalendarEntry = { key: string; date: string; time: string; clip: any; projectId?: string; kind: "posted" | "queued" | "overdue"; platforms: string[] };

const ENTRY_TONE: Record<CalendarEntry["kind"], string> = {
  posted: "bg-emerald-100 text-emerald-800",
  queued: "bg-violet-100 text-violet-800",
  overdue: "bg-rose-100 text-rose-800",
};

/**
 * Month view of what went out (recorded posts, back-dated ones included) and
 * what is still queued. A clip posted on its queue day shows once, as posted.
 */
function CalendarView({ onOpen }: { onOpen: (clip: any) => void }) {
  const router = useRouter(); const sp = useSearchParams();
  const today = new Date();
  const todayKey = dateKey(today);
  const raw = sp.get("month"); const initial = raw && /^\d{4}-\d{2}$/.test(raw) ? new Date(`${raw}-01T00:00:00`) : new Date();
  const month = new Date(initial.getFullYear(), initial.getMonth(), 1); const projectId = sp.get("projectId") || "";
  // Fetch the whole visible grid (6 weeks), not only the month itself.
  const days = useMemo(() => { const cursor = new Date(month); cursor.setDate(cursor.getDate() - cursor.getDay()); return Array.from({ length: 42 }, (_, i) => { const day = new Date(cursor); day.setDate(cursor.getDate() + i); return day; }); }, [raw]);
  const range = { projectId: projectId || undefined, from: dateKey(days[0]), to: dateKey(days[days.length - 1]) };
  const { data: queue, isLoading: queueLoading, error: queueError } = usePublishQueue(range);
  const { data: posted, isLoading: postedLoading, error: postedError } = usePostedByDate(range);
  const { data: projects } = useProjects({ isActive: true });
  const update = (values: Record<string, string | undefined>) => { const next = new URLSearchParams(sp.toString()); Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); next.set("tab", "calendar"); router.replace(`?${next.toString()}`, { scroll: false }); };
  const move = (delta: number) => { const next = new Date(month.getFullYear(), month.getMonth() + delta, 1); update({ month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}` }); };
  const goToday = () => update({ month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}` });

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    const add = (entry: CalendarEntry) => map.set(entry.date, [...(map.get(entry.date) || []), entry]);
    const postedKeys = new Set(posted.map((item) => `${item.clipId}:${item.date}`));
    posted.forEach((item) => add({ key: `p-${item.clipId}-${item.date}`, date: item.date, time: item.time, clip: item.clip, projectId: item.projectId, kind: "posted", platforms: item.platforms }));
    queue.forEach((item) => {
      if (postedKeys.has(`${item.clipId}:${item.publishDate}`)) return;
      const done = (item.clip?.publishedPosts?.length || 0) >= 4;
      if (done) return; // already shown on the day it was posted
      const overdue = new Date(`${item.publishDate}T${item.publishTime}+07:00`).getTime() < Date.now();
      add({ key: `q-${item.id}`, date: item.publishDate, time: String(item.publishTime).slice(0, 5), clip: item.clip, projectId: item.projectId, kind: overdue ? "overdue" : "queued", platforms: [] });
    });
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [queue, posted]);

  const inMonth = (key: string) => key.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`);
  const monthEntries = [...byDate.entries()].filter(([key]) => inMonth(key)).sort(([a], [b]) => a.localeCompare(b));
  const postedCount = monthEntries.reduce((sum, [, list]) => sum + list.filter((e) => e.kind === "posted").length, 0);
  const queuedCount = monthEntries.reduce((sum, [, list]) => sum + list.filter((e) => e.kind !== "posted").length, 0);
  const isLoading = queueLoading || postedLoading;
  const error = queueError || postedError;

  const entryLabel = (entry: CalendarEntry) => entry.kind === "posted" ? `${entry.platforms.length}/4` : entry.kind === "overdue" ? "ยังไม่โพสต์" : "คิว";

  return <section className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => move(-1)} aria-label="เดือนก่อน"><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="min-w-[150px] text-center text-lg font-black text-slate-900">{month.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</h2>
          <Button variant="ghost" size="sm" onClick={() => move(1)} aria-label="เดือนถัดไป"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="ml-1 bg-blue-50 font-bold text-blue-700 hover:bg-blue-100">วันนี้</Button>
        </div>
        <p className="mt-1 pl-2 text-xs text-slate-500">เดือนนี้โพสต์แล้ว {postedCount} คลิป · รอ/ค้างโพสต์ {queuedCount} คิว</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />โพสต์แล้ว</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-violet-400" />รอคิว</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" />เลยเวลา ยังไม่โพสต์</span>
        </div>
        <select value={projectId} onChange={(e) => update({ projectId: e.target.value || undefined })} className="h-9 rounded-xl bg-slate-50 px-3 text-xs font-bold outline-none ring-1 ring-inset ring-slate-200"><option value="">ทุกรายการ</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </div>
    </div>

    {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-10 text-center text-sm font-bold text-rose-700">โหลดปฏิทินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : <>
      {/* Desktop / tablet: month grid. */}
      <div className="mt-4 hidden overflow-hidden rounded-2xl bg-slate-100 p-px md:block"><div className="grid grid-cols-7 gap-px">
        {SHORT_DAYS.map((d) => <div key={d} className="bg-slate-50 py-2 text-center text-[11px] font-black text-slate-500">{d}</div>)}
        {days.map((day) => {
          const key = dateKey(day); const isToday = key === todayKey;
          return <div key={key} className={`min-h-[112px] p-1.5 ${isToday ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : inMonth(key) ? "bg-white" : "bg-slate-50/70"}`}>
            <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${isToday ? "bg-blue-600 text-white" : inMonth(key) ? "text-slate-600" : "text-slate-300"}`}>{day.getDate()}</span>
            <div className="mt-1 space-y-1">{(byDate.get(key) || []).map((entry) => <button key={entry.key} onClick={() => entry.clip && onOpen(entry.clip)} title={`${entry.time} ${entry.clip?.name || ""}`} className={`block w-full rounded-lg px-1.5 py-1 text-left text-[10px] font-bold leading-tight transition-transform hover:-translate-y-0.5 ${ENTRY_TONE[entry.kind]}`}>
              <span className="flex items-center justify-between gap-1"><span>{entry.time}</span><span className="opacity-80">{entryLabel(entry)}</span></span>
              <span className="line-clamp-2">{entry.clip?.name}</span>
            </button>)}</div>
          </div>;
        })}
      </div></div>

      {/* Phone: agenda list of the month. */}
      <div className="mt-4 space-y-3 md:hidden">
        {monthEntries.length === 0 && !isLoading && <p className="rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-500">เดือนนี้ยังไม่มีโพสต์หรือคิว</p>}
        {monthEntries.map(([key, list]) => <div key={key}>
          <p className={`mb-1.5 text-xs font-black ${key === todayKey ? "text-blue-700" : "text-slate-500"}`}>{new Date(`${key}T00:00:00`).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "short" })}{key === todayKey ? " · วันนี้" : ""}</p>
          <div className="space-y-1.5">{list.map((entry) => <button key={entry.key} onClick={() => entry.clip && onOpen(entry.clip)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${ENTRY_TONE[entry.kind]}`}>
            <span className="text-xs font-black tabular-nums">{entry.time}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{entry.clip?.name}</span>
            <span className="shrink-0 text-[11px] font-bold opacity-80">{entryLabel(entry)}</span>
          </button>)}</div>
        </div>)}
      </div>
    </>}
    {isLoading && <div className="flex justify-center gap-2 py-5 text-xs text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...</div>}
  </section>;
}

export function PublishDashboard() {
  const router = useRouter(); const sp = useSearchParams();
  const tab: TabId = sp.get("tab") === "calendar" ? "calendar" : "manage";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const view = sp.get("view") === "done" ? "done" : sp.get("view") === "all" ? "all" : "todo";
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
  const { items, pagination, isLoading, error: itemsError } = usePublishItems({ page, limit, q: sp.get("q") || undefined, projectId: sp.get("projectId") || undefined, ownerId: sp.get("ownerId") || undefined, postingState: view === "all" ? undefined : view === "done" ? "completed" : "incomplete", from: sp.get("from") || undefined, to: sp.get("to") || undefined, sortBy: "scheduledAt", sortOrder: "asc" });
  const update = (values: Record<string, string | undefined>, reset = true) => { const next = new URLSearchParams(sp.toString()); Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k)); if (reset) next.set("page", "1"); router.replace(`?${next.toString()}`, { scroll: false }); };
  useEffect(() => { const timer = setTimeout(() => { if (search !== (sp.get("q") || "")) update({ q: search || undefined }); }, 350); return () => clearTimeout(timer); }, [search]);
  const showStatus = (key: string) => update({ view: key === "todo" ? undefined : key });
  const reset = () => { setSearch(""); router.replace("?tab=manage"); };
  const selectToday = () => { const today = dateKey(new Date()); update({ from: today, to: today }); };
  const openClip = (clip: any, nextTab?: PublishModalTab) => { setModalTab(nextTab); setSelectedClip(clip); };
  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageStart + index);

  const statuses = [
    { key: "todo", label: "รอโพสต์", count: summary?.pending, hint: "ผ่านการตรวจแล้ว ยังโพสต์ไม่ครบ 4 ช่องทาง" },
    { key: "done", label: "โพสต์แล้ว", count: summary?.completed, hint: "โพสต์ครบ 4 ช่องทาง" },
    { key: "all", label: "ทั้งหมด", count: summary?.total, hint: "" },
  ];
  const activeStatus = view;

  return <div className="space-y-4 pb-12">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-black text-slate-900">เผยแพร่คลิป</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">ดาวน์โหลด → คัดลอกแคปชั่น → โพสต์ → กด “โพสต์ครบแล้ว”</p>
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

      <section className="space-y-3">{itemsError ? <div className="rounded-3xl bg-rose-50 py-16 text-center text-sm font-bold text-rose-700">โหลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div> : isLoading ? <div className="flex justify-center rounded-3xl bg-white py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div> : items.length === 0 ? <div className="rounded-3xl bg-white py-16 text-center text-sm text-slate-500">{activeStatus === "todo" ? "ไม่มีคลิปค้างโพสต์ 🎉" : "ไม่พบคลิปตามเงื่อนไข"}</div> : items.map((clip) => <PublishRow key={clip.id} clip={clip} onOpen={(nextTab) => openClip(clip, nextTab)} />)}</section>
      {pagination && totalPages > 1 && <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-slate-500">ทั้งหมด {pagination.total} รายการ · หน้า {pagination.page}/{totalPages}</span><div className="flex flex-wrap items-center gap-2"><select value={limit} onChange={(e) => update({ limit: e.target.value })} className="h-9 rounded-lg bg-slate-50 px-2 text-xs outline-none ring-1 ring-inset ring-slate-200"><option value="20">20 / หน้า</option><option value="50">50 / หน้า</option><option value="100">100 / หน้า</option></select><Button variant="ghost" size="sm" disabled={!pagination.hasPrevious} onClick={() => update({ page: String(page - 1) }, false)}><ChevronLeft className="h-4 w-4" /></Button>{pageNumbers.map((pageNumber) => <button key={pageNumber} onClick={() => update({ page: String(pageNumber) }, false)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{pageNumber}</button>)}<Button variant="ghost" size="sm" disabled={!pagination.hasNext} onClick={() => update({ page: String(page + 1) }, false)}><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
    <PublishSlotsModal open={slotsOpen} onOpenChange={setSlotsOpen} />{selectedClip && <PublishModal key={selectedClip.id} clip={selectedClip} initialTab={modalTab} isOpen={!!selectedClip} onClose={() => setSelectedClip(null)} />}
  </div>;
}
