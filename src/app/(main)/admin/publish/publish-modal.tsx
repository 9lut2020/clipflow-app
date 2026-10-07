"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  History,
  Loader2,
  Download,
  CalendarClock,
  CalendarCheck2,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePublishRecords,
  usePublishClip,
} from "@/features/clips/hooks/use-publish";
import { ScheduleEditor } from "@/components/publish/schedule-editor";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export type PublishModalTab = "record" | "schedule";

interface PublishModalProps {
  clip: any;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PublishModalTab;
}

const PLATFORMS = [
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE_SHORTS", label: "YouTube Shorts" },
  { id: "FACEBOOK_REELS", label: "Facebook Reels" },
  { id: "INSTAGRAM_REELS", label: "Instagram Reels" },
];

function toLocalInput(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Quick picks for "when was it posted" — the common case is today or a day or two ago. */
function quickDates(scheduledAt: Date | null) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const picks = [
    { label: "ตอนนี้", value: now },
    { label: "เมื่อวาน", value: yesterday },
  ];
  if (scheduledAt && scheduledAt.getTime() < now.getTime()) picks.unshift({ label: "ตามเวลาที่ตั้งคิวไว้", value: scheduledAt });
  return picks;
}

export function PublishModal({ clip, isOpen, onClose, initialTab }: PublishModalProps) {
  const scheduledAt = clip.scheduledPublishAt ? new Date(clip.scheduledPublishAt) : null;
  const defaultTab: PublishModalTab = initialTab || (scheduledAt ? "record" : "schedule");
  const [tab, setTab] = useState<PublishModalTab>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  // null = untouched: every platform not yet recorded is ticked.
  const [picked, setPicked] = useState<string[] | null>(null);
  const [url, setUrl] = useState("");
  const [postedAt, setPostedAt] = useState(() => toLocalInput(scheduledAt && scheduledAt.getTime() < Date.now() ? scheduledAt : new Date()));

  const { data: publishedPosts, isLoading: isLoadingRecords } =
    usePublishRecords(clip.id);
  const { publishClip, isPublishing } = usePublishClip();

  const approvedClipUrl = clip.currentRevision?.driveUrl || clip.driveUrl || "";
  const downloadUrl = (() => {
    const driveId = approvedClipUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || approvedClipUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
    return driveId
      ? `https://drive.google.com/uc?export=download&id=${driveId}`
      : approvedClipUrl;
  })();

  const generatedCaption = `${clip.name}
.
ส่วนหนึ่งจากคลิปเต็ม รายการ ${clip.project?.name || "อัลมะดาริจญ์"} ตอนที่ ${clip.episode?.episodeNo || ""}
["${clip.episode?.name || ""}"]
.
ข้อคิดหนึ่งจากอัลกุรอาน เพื่อการทบทวนและพัฒนาตนเอง
.
#${clip.project?.name || "อัลมะดาริจญ์"} #แนวคิดการพัฒนาตนเองจากอัลกุรอาน #อิสลาม #มุสลิม #ข้อคิดอิสลาม #พัฒนาตนเอง #เตือนใจ #tmyda`;

  const [caption, setCaption] = useState(generatedCaption);
  const clipTitle = `${clip.name} | รายการ ${clip.project?.name || "อัลมะดาริจญ์"} ตอนที่ ${clip.episode?.episodeNo || ""}`;

  const postedPlatforms = new Set((publishedPosts || []).map((p: any) => p.platform));
  const remaining = PLATFORMS.filter((p) => !postedPlatforms.has(p.id));

  const platforms = (picked ?? remaining.map((p) => p.id)).filter((id) => !postedPlatforms.has(id));

  const copy = async (text: string, done: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    done(true);
    setTimeout(() => done(false), 2000);
  };

  const postedDate = postedAt ? new Date(postedAt) : null;
  const isFuture = postedDate ? postedDate.getTime() > Date.now() + 60_000 : false;

  const handlePublish = async () => {
    if (platforms.length === 0 || !postedDate || isFuture) return;
    try {
      await Promise.all(
        platforms.map((platform) =>
          publishClip({
            clipId: clip.id,
            platform,
            caption,
            url: url || undefined,
            publishedAt: postedDate.toISOString(),
          }),
        ),
      );
      toast.success(`บันทึกแล้ว ${platforms.length} แพลตฟอร์ม`);
      setUrl("");
      setPicked(null);
    } catch (err: any) {
      toast.error(err?.message || "บันทึกไม่สำเร็จ");
    }
  };

  const togglePlatform = (id: string) => {
    setPicked(platforms.includes(id) ? platforms.filter((p) => p !== id) : [...platforms, id]);
  };

  const header = (
    <div className="border-b border-slate-100 bg-slate-50 px-5 pb-4 pt-5 sm:px-6">
      <DialogTitle className="m-0 line-clamp-2 p-0 text-lg font-bold text-slate-900">
        {clip.name}
      </DialogTitle>
      <DialogDescription className="mt-1 text-xs font-medium text-slate-500">
        {clip.project?.name} · EP {clip.episode?.episodeNo || "-"} · โพสต์แล้ว {postedPlatforms.size}/4
        {scheduledAt && ` · คิว ${scheduledAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}`}
      </DialogDescription>
      <div className="mt-3 flex flex-wrap gap-2">
        {approvedClipUrl ? (
          <>
            <a href={downloadUrl} target="_blank" rel="noreferrer" download className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700">
              <Download className="h-3.5 w-3.5" /> ดาวน์โหลด
            </a>
            <a href={approvedClipUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <ExternalLink className="h-3.5 w-3.5" /> เปิดคลิป
            </a>
          </>
        ) : (
          <span className="text-xs font-semibold text-rose-500">ยังไม่มีลิงก์คลิปที่ผ่านการตรวจ</span>
        )}
        <button type="button" onClick={() => copy(clipTitle, setCopiedTitle)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${copiedTitle ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          {copiedTitle ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copiedTitle ? "คัดลอกแล้ว" : "คัดลอกชื่อ"}
        </button>
        <button type="button" onClick={() => copy(caption, setCopied)} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold ${copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "คัดลอกแล้ว" : "คัดลอกแคปชั่น"}
        </button>
      </div>
      <button type="button" onClick={() => setShowCaption((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800">
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCaption ? "rotate-180" : ""}`} /> {showCaption ? "ซ่อนแคปชั่น" : "ดู / แก้แคปชั่น"}
      </button>
      {showCaption && (
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="mt-2 min-h-[160px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      )}
    </div>
  );

  const tabs = (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
      {([
        { id: "record", label: "บันทึกว่าโพสต์แล้ว", icon: CalendarCheck2 },
        { id: "schedule", label: "ตั้งคิวโพสต์", icon: CalendarClock },
      ] as const).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setTab(item.id)}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors ${tab === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          <item.icon className="h-4 w-4" /> {item.label}
        </button>
      ))}
    </div>
  );

  const recordPanel = (
    <section className="space-y-4">
      {remaining.length === 0 && !isLoadingRecords ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-sm font-bold text-emerald-700">
          <CheckCircle2 className="mx-auto mb-1 h-6 w-6" /> โพสต์ครบทั้ง 4 แพลตฟอร์มแล้ว
        </div>
      ) : (
        <>
          <div>
            <p className="mb-2 text-xs font-bold text-slate-600">1. โพสต์ลงที่ไหนบ้าง</p>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => {
                const isPosted = postedPlatforms.has(p.id);
                const isOn = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isPosted}
                    onClick={() => togglePlatform(p.id)}
                    aria-pressed={isOn}
                    className={`flex h-12 items-center gap-2.5 rounded-xl border px-3 text-left text-sm font-semibold transition-colors ${
                      isPosted
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                        : isOn
                          ? "border-blue-300 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${isPosted ? "border-emerald-500 bg-emerald-500 text-white" : isOn ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                      {(isPosted || isOn) && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] leading-tight">{p.label}</span>
                      {isPosted && <span className="-mt-0.5 block text-[10px] font-bold text-emerald-600">โพสต์แล้ว</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-slate-600">2. โพสต์เมื่อไหร่ <span className="font-medium text-slate-400">(ย้อนหลังได้)</span></p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickDates(scheduledAt).map((pick) => {
                const value = toLocalInput(pick.value);
                return (
                  <button key={pick.label} type="button" onClick={() => setPostedAt(value)} className={`h-8 rounded-full border px-3 text-xs font-bold ${postedAt === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                    {pick.label}
                  </button>
                );
              })}
            </div>
            <input
              type="datetime-local"
              value={postedAt}
              max={toLocalInput(new Date())}
              onChange={(e) => setPostedAt(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {isFuture && <p className="mt-1 text-xs font-semibold text-rose-600">เวลาอยู่ในอนาคต ถ้ายังไม่ได้โพสต์ให้ใช้แท็บ “ตั้งคิวโพสต์”</p>}
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-slate-600">3. ลิงก์โพสต์ <span className="font-medium text-slate-400">(ไม่ใส่ก็ได้)</span></p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              inputMode="url"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button
            onClick={handlePublish}
            disabled={platforms.length === 0 || isPublishing || !postedDate || isFuture}
            className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
          >
            {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            บันทึกว่าโพสต์แล้ว{platforms.length > 0 ? ` (${platforms.length})` : ""}
          </Button>
        </>
      )}
    </section>
  );

  const history = (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800"><History className="h-4 w-4 text-blue-600" /> ประวัติการโพสต์</h3>
      {isLoadingRecords ? (
        <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : publishedPosts?.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">ยังไม่มีประวัติการโพสต์</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {publishedPosts?.map((post: any) => (
            <li key={post.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{PLATFORMS.find((p) => p.id === post.platform)?.label || post.platform}</p>
                <p className="text-[11px] text-slate-500">{format(new Date(post.publishedAt), "d MMM yyyy, HH:mm", { locale: th })}</p>
              </div>
              {post.url && (
                <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                  <ExternalLink className="h-3 w-3" /> เปิดโพสต์
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  // Dialog is responsive: centred modal on desktop, swipe-to-close sheet on
  // phones. The pieces are plain elements (not inner components) so their
  // inputs keep focus while typing.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl">
        {header}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {tabs}
          {tab === "record" ? recordPanel : <ScheduleEditor clip={clip} />}
          {history}
        </div>
      </DialogContent>
    </Dialog>
  );
}
