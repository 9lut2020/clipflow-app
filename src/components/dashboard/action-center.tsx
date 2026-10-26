"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Eye,
  FolderOpen,
  Loader2,
  PartyPopper,
  RefreshCcw,
  Share2,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { InlineSubmitModal } from "@/app/(main)/tasks/task-accordion";
import { usePublishSummary } from "@/features/clips/hooks/use-publish-schedules";
import type { Clip } from "@/types/api";

/**
 * "ต้องทำตอนนี้" — the top of the home page answers one question for each
 * role: what needs me right now? Every card has one obvious button.
 *   editor   → fix what was sent back, then submit assigned work
 *   reviewer → review the oldest submission first
 *   admin    → review, hand out unassigned work, post what passed
 */

type ListResult = { items: Clip[]; total: number };

const KEY_PREFIX = "/clips?action-center";

const listFetcher = async (key: string): Promise<ListResult> => {
  const query = key.slice(key.indexOf("&") + 1);
  const res = await apiClient.get<{ items: Clip[]; pagination: { total: number } }>(`/clips?${query}`);
  if (res.status !== "success" || !res.data) throw new Error(res.message);
  return { items: res.data.items || [], total: res.data.pagination?.total ?? res.data.items.length };
};

function useClipList(query: string | null) {
  return useSWR<ListResult>(query ? `${KEY_PREFIX}&${query}` : null, listFetcher, { revalidateOnFocus: true });
}

const sourceOf = (clip: any): string => clip.sourceUrl || clip.episode?.sourceUrl || "";

function DeadlineChip({ deadline }: { deadline?: string | null }) {
  if (!deadline) return null;
  const due = new Date(deadline);
  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  const tone = days < 0 ? "bg-rose-100 text-rose-700" : days <= 1 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  const label = days < 0 ? `เลยกำหนด ${-days} วัน` : days === 0 ? "ส่งวันนี้" : days === 1 ? "ส่งพรุ่งนี้" : `ส่งภายใน ${due.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}`;
  return <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${tone}`}><CalendarClock className="h-3 w-3" />{label}</span>;
}

function ClipMeta({ clip }: { clip: any }) {
  return (
    <p className="mt-0.5 truncate text-xs text-slate-500">
      {clip.project?.name} · EP {clip.episode?.episodeNo ?? "-"}
      {clip.kind === "POSTER" && <span className="ml-1.5 rounded bg-pink-50 px-1 font-bold text-pink-700">โปสเตอร์</span>}
    </p>
  );
}

function Section({ title, count, tone, icon: Icon, children, more }: { title: string; count: number; tone: string; icon: typeof Eye; children: React.ReactNode; more?: { href: string; label: string } }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
          {title}
          <span className="rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">{count}</span>
        </h3>
        {more && <Link href={more.href} className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 hover:underline">{more.label}<ArrowRight className="h-3.5 w-3.5" /></Link>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/* ─── Editor ─────────────────────────────────────────────────────────── */

function EditorActions({ userId }: { userId: string }) {
  const { mutate } = useSWRConfig();
  const fix = useClipList("status=NEEDS_REVISION&sortBy=updatedAt&sortOrder=asc&limit=20");
  const todo = useClipList("status=DRAFT&sortBy=deadline&sortOrder=asc&limit=20");
  const waiting = useClipList("status=PENDING_REVIEW,IN_REVIEW,RESUBMITTED&sortBy=updatedAt&sortOrder=desc&limit=5");
  const [submitting, setSubmitting] = useState<{ clip: Clip; mode: "submit" | "resubmit" } | null>(null);

  const refresh = () => mutate((key: any) => typeof key === "string" && (key.startsWith(KEY_PREFIX) || key.startsWith("/clips")));
  const loading = fix.isLoading || todo.isLoading;
  const fixItems = fix.data?.items || [];
  const todoItems = todo.data?.items || [];

  return (
    <>
      {submitting && (
        <InlineSubmitModal
          clip={submitting.clip}
          userId={userId}
          mode={submitting.mode}
          onClose={() => { setSubmitting(null); refresh(); }}
        />
      )}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : fixItems.length + todoItems.length === 0 ? (
        <AllClear text="ไม่มีงานค้าง ส่งครบทุกงานแล้ว" />
      ) : (
        <div className="space-y-5">
          {fixItems.length > 0 && (
            <Section title="ต้องแก้ไข" count={fix.data?.total || 0} tone="bg-rose-100 text-rose-600" icon={AlertTriangle}>
              {fixItems.map((clip: any) => (
                <article key={clip.id} className="rounded-2xl border border-rose-200 bg-white p-3.5 shadow-xs">
                  <Link href={`/clips/${clip.id}`} className="block">
                    <h4 className="line-clamp-2 font-bold leading-snug text-slate-900">{clip.name}</h4>
                    <ClipMeta clip={clip} />
                  </Link>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href={`/clips/${clip.id}`} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" /> ดูที่ต้องแก้</Link>
                    <button onClick={() => setSubmitting({ clip, mode: "resubmit" })} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700"><RefreshCcw className="h-4 w-4" /> ส่งงานแก้ไข</button>
                  </div>
                </article>
              ))}
            </Section>
          )}
          {todoItems.length > 0 && (
            <Section title="รอส่งงาน" count={todo.data?.total || 0} tone="bg-blue-100 text-blue-600" icon={UploadCloud}>
              {todoItems.map((clip: any) => {
                const source = sourceOf(clip);
                return (
                  <article key={clip.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/clips/${clip.id}`} className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 font-bold leading-snug text-slate-900">{clip.name}</h4>
                        <ClipMeta clip={clip} />
                      </Link>
                      <DeadlineChip deadline={clip.deadline} />
                    </div>
                    {clip.description && <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{clip.description}</p>}
                    <div className={`mt-3 grid gap-2 ${source ? "grid-cols-2" : "grid-cols-1"}`}>
                      {source && (
                        <a href={source} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"><FolderOpen className="h-4 w-4" /> ไฟล์ต้นฉบับ</a>
                      )}
                      <button onClick={() => setSubmitting({ clip, mode: "submit" })} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"><UploadCloud className="h-4 w-4" /> ส่งงาน</button>
                    </div>
                  </article>
                );
              })}
            </Section>
          )}
        </div>
      )}
      {(waiting.data?.items.length || 0) > 0 && (
        <div className="mt-5 rounded-2xl bg-amber-50/70 p-3">
          <p className="mb-1.5 text-xs font-bold text-amber-800">ส่งแล้ว รอผลตรวจ ({waiting.data?.total})</p>
          <ul className="space-y-1">
            {waiting.data!.items.map((clip) => (
              <li key={clip.id}><Link href={`/clips/${clip.id}`} className="block truncate text-[13px] font-semibold text-slate-700 hover:text-blue-700">{clip.name}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ─── Reviewer / admin review queue ───────────────────────────────────── */

function ReviewQueue({ limit, more }: { limit: number; more?: boolean }) {
  const review = useClipList(`status=PENDING_REVIEW,IN_REVIEW,RESUBMITTED&sortBy=updatedAt&sortOrder=asc&limit=${limit}`);
  const items = review.data?.items || [];
  if (review.isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>;
  if (!items.length) return null;
  return (
    <Section title="รอตรวจ" count={review.data?.total || 0} tone="bg-amber-100 text-amber-600" icon={Eye} more={more && (review.data?.total || 0) > items.length ? { href: "/tasks", label: "ดูทั้งหมด" } : undefined}>
      {items.map((clip: any) => (
        <Link key={clip.id} href={`/clips/${clip.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-colors hover:border-amber-300">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-bold text-slate-900">{clip.name}</h4>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {clip.owner?.displayName || "ไม่ระบุ"} · {clip.project?.name}
              {clip.status === "RESUBMITTED" && <span className="ml-1.5 font-bold text-orange-600">ส่งแก้แล้ว</span>}
            </p>
          </div>
          <span className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl bg-amber-500 px-4 text-sm font-bold text-white">ตรวจเลย</span>
        </Link>
      ))}
    </Section>
  );
}

/* ─── Admin: hand out unassigned work inline ──────────────────────────── */

type Member = { id: string; displayName: string; projectRole?: string };

function QuickAssign({ clip, onDone }: { clip: any; onDone: () => void }) {
  const [ownerId, setOwnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: members = [] } = useSWR<Member[]>(`/projects/${clip.project?.id}/members?page=1&limit=100&isActive=true`, async (url: string) => {
    const res = await apiClient.get<{ items: Member[] }>(url);
    return (res.data?.items || []).filter((m) => m.projectRole !== "REVIEWER");
  }, { revalidateOnFocus: false });

  const assign = async () => {
    if (!ownerId) return;
    setSaving(true);
    try {
      const res = await apiClient.patch<any>(`/clips/${clip.id}/owner`, { ownerId });
      if (res.status !== "success") throw new Error(res.message);
      toast.success(`มอบหมาย "${clip.name}" ให้ ${members.find((m) => m.id === ownerId)?.displayName} แล้ว`);
      onDone();
    } catch (error: any) {
      toast.error(error.message || "มอบหมายไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-2xl border border-dashed border-violet-300 bg-white p-3.5">
      <Link href={`/clips/${clip.id}`} className="block">
        <h4 className="truncate font-bold text-slate-900">{clip.name}</h4>
        <ClipMeta clip={clip} />
      </Link>
      <div className="mt-2.5 flex gap-2">
        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500">
          <option value="">{members.length ? "เลือกคนตัดต่อ..." : "ยังไม่มีคนตัดต่อในโปรเจกต์"}</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
        </select>
        <button onClick={assign} disabled={!ownerId || saving} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} มอบหมาย
        </button>
      </div>
    </article>
  );
}

function AdminActions() {
  const { mutate } = useSWRConfig();
  const unassigned = useClipList("status=DRAFT&ownerId=none&sortBy=createdAt&sortOrder=asc&limit=5");
  const { data: publish } = usePublishSummary();
  const refresh = () => mutate((key: any) => typeof key === "string" && (key.startsWith(KEY_PREFIX) || key.startsWith("/clips")));
  const unassignedItems = unassigned.data?.items || [];
  const toPost = publish?.pending || 0;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <ReviewQueue limit={5} more />
      {unassignedItems.length > 0 && (
        <Section title="รอมอบหมาย" count={unassigned.data?.total || 0} tone="bg-violet-100 text-violet-600" icon={UserPlus} more={(unassigned.data?.total || 0) > unassignedItems.length ? { href: "/tasks", label: "ดูทั้งหมด" } : undefined}>
          {unassignedItems.map((clip) => <QuickAssign key={clip.id} clip={clip} onDone={refresh} />)}
        </Section>
      )}
      {toPost > 0 && (
        <Link href="/admin/publish" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 transition-colors hover:bg-emerald-100 xl:col-span-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Share2 className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-900">ผ่านแล้ว รอโพสต์ {toPost} คลิป</p>
            <p className="text-xs text-emerald-700">ดาวน์โหลด คัดลอกแคปชั่น แล้วกด “โพสต์ครบแล้ว”</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-emerald-700" />
        </Link>
      )}
      {!unassigned.isLoading && unassignedItems.length === 0 && toPost === 0 && <AdminAllClear />}
    </div>
  );
}

/** Shown only when the review queue is empty as well. */
function AdminAllClear() {
  const review = useClipList("status=PENDING_REVIEW,IN_REVIEW,RESUBMITTED&sortBy=updatedAt&sortOrder=asc&limit=5");
  if (review.isLoading || (review.data?.items.length || 0) > 0) return null;
  return <AllClear text="ไม่มีงานที่รอคุณอยู่ตอนนี้" />;
}

function AllClear({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
      <PartyPopper className="h-6 w-6 shrink-0" />
      <p className="text-sm font-bold">{text} 🎉</p>
    </div>
  );
}

export function ActionCenter({ role, userId }: { role: string; userId: string }) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
        <CheckCircle2 className="h-5 w-5 text-blue-600" /> ต้องทำตอนนี้
      </h2>
      {role === "USER" ? <EditorActions userId={userId} /> : role === "REVIEWER" ? (
        <><ReviewQueue limit={10} more /><ReviewerAllClear /></>
      ) : <AdminActions />}
    </section>
  );
}

function ReviewerAllClear() {
  const review = useClipList("status=PENDING_REVIEW,IN_REVIEW,RESUBMITTED&sortBy=updatedAt&sortOrder=asc&limit=10");
  if (review.isLoading || (review.data?.items.length || 0) > 0) return null;
  return <AllClear text="ไม่มีงานรอตรวจ" />;
}
