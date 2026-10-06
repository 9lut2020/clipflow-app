"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Clock, Repeat, Send, Sparkles, Timer } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";

/* Validated categorical slots (dataviz reference palette, light mode). */
const SERIES = {
  submitted: "#2a78d6", // slot 1 blue
  approved: "#1baf7a", // slot 3 aqua — below 3:1 contrast, so always direct-labelled + table view
  revision: "#eb6834", // slot 2 orange
  remaining: "#d4d4d8", // neutral "not started"
};

type Overview = {
  scope: "self" | "team";
  range: string;
  granularity: "day" | "month";
  kpis: {
    submitted: number;
    approvedReviews: number;
    revisionRequests: number;
    approvedClips: number;
    firstPassRate: number | null;
    avgRevisions: number | null;
    avgTurnaroundHours: number | null;
    avgReviewHours: number | null;
  };
  statusCounts: Record<string, number>;
  trend: { date: string; submitted: number; approved: number }[];
  projects: { id: string; name: string; total: number; done: number; inReview: number; needsRevision: number; notStarted: number }[];
  editors: { id: string; name: string; pictureUrl: string | null; assigned: number; submissions: number; approved: number; firstPassRate: number | null; avgRevisions: number | null }[];
  reviewers: { id: string; name: string; pictureUrl: string | null; reviews: number; approved: number; sentBack: number; avgReviewHours: number | null }[];
  projectOptions: { id: string; name: string }[];
};

const RANGES = [
  { value: "7", label: "7 วัน" },
  { value: "30", label: "30 วัน" },
  { value: "90", label: "90 วัน" },
  { value: "all", label: "ทั้งหมด" },
];

const STATUS_ORDER = ["DRAFT", "PENDING_REVIEW", "IN_REVIEW", "RESUBMITTED", "NEEDS_REVISION", "APPROVED", "PUBLISHED", "CANCELLED"];

const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatBucket(date: string, granularity: "day" | "month") {
  const [, m, d] = date.split("-").map(Number);
  return granularity === "month" ? MONTHS_TH[m - 1] : `${d} ${MONTHS_TH[m - 1]}`;
}

function formatHours(hours: number | null) {
  if (hours === null || Number.isNaN(hours)) return "–";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} นาที`;
  if (hours < 48) return `${hours.toFixed(1)} ชม.`;
  return `${(hours / 24).toFixed(1)} วัน`;
}

const fetcher = async (url: string) => {
  const res = await apiClient.get<Overview>(url);
  if (res.status !== "success" || !res.data) throw new Error(res.message || "โหลดข้อมูลไม่สำเร็จ");
  return res.data;
};

export function AnalyticsClient({ role }: { role: "USER" | "REVIEWER" | "ADMIN" }) {
  const [range, setRange] = useState("30");
  const [projectId, setProjectId] = useState("");
  const key = `/analytics/overview?range=${range}${projectId ? `&projectId=${projectId}` : ""}`;
  // keepPreviousData: a refetch keeps the current charts (dimmed) instead of flashing.
  const { data, error, isLoading, isValidating } = useSWR(key, fetcher, { keepPreviousData: true, revalidateOnFocus: false });

  const isSelf = role === "USER";
  const rangeLabel = RANGES.find((r) => r.value === range)?.label ?? "";

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="flex flex-col gap-1 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-base sm:text-lg font-bold text-slate-900">{isSelf ? "สถิติผลงานของฉัน" : "รายงานวิเคราะห์การผลิต"}</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          {isSelf
            ? "ติดตามงานที่ส่ง ผลการตรวจ และความคืบหน้าของคุณ"
            : "ภาพรวมการส่งงาน การตรวจ และความคืบหน้าของทีม"}
        </p>
      </div>

      {/* Filters: one row above everything they scope. */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="ช่วงเวลา" className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={range === r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${range === r.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <select
          aria-label="โปรเจกต์"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-[38px] max-w-[240px] rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-400"
        >
          <option value="">ทุกโปรเจกต์</option>
          {(data?.projectOptions ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {isValidating && data && <span className="text-xs text-slate-400">กำลังอัปเดต…</span>}
      </div>

      {error && !data && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">ไม่สามารถโหลดสถิติได้ ลองรีเฟรชหน้าอีกครั้ง</div>
      )}
      {isLoading && !data && <LoadingState />}

      {data && (
        <div className={`space-y-4 sm:space-y-6 transition-opacity ${isValidating ? "opacity-60" : ""}`}>
          <KpiRow data={data} isSelf={isSelf} rangeLabel={rangeLabel} />

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <Card title="การส่งงานและการอนุมัติ" subtitle={data.granularity === "month" ? "รายเดือน (12 เดือนล่าสุด)" : `รายวัน (${rangeLabel}ล่าสุด)`} className="lg:col-span-2">
              <TrendChart trend={data.trend} granularity={data.granularity} />
            </Card>
            <Card title="สถานะคลิปตอนนี้" subtitle={isSelf ? "คลิปที่ได้รับมอบหมายทั้งหมด" : "คลิปทั้งหมดในขอบเขตที่เลือก"}>
              <StatusBreakdown counts={data.statusCounts} />
            </Card>
          </div>

          <Card title="ความคืบหน้ารายโปรเจกต์" subtitle="สถานะปัจจุบันของคลิปในแต่ละโปรเจกต์">
            <ProjectProgress projects={data.projects} />
          </Card>

          {!isSelf && (
            <Card title="นักตัดต่อ" subtitle={`ผลงานช่วง ${rangeLabel}`}>
              <EditorsTable editors={data.editors} />
            </Card>
          )}
          {role === "ADMIN" && (
            <Card title="ผู้ตรวจงาน" subtitle={`การตรวจช่วง ${rangeLabel}`}>
              <ReviewersTable reviewers={data.reviewers} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Layout pieces ─────────────────────────────────────────────────────── */

function Card({ title, subtitle, className = "", children }: { title: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs ${className}`}>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function KpiRow({ data, isSelf, rangeLabel }: { data: Overview; isSelf: boolean; rangeLabel: string }) {
  const k = data.kpis;
  const tiles = [
    { icon: Send, label: isSelf ? "ส่งงานไป" : "งานที่ส่งเข้ามา", value: k.submitted.toLocaleString(), hint: `ครั้ง ใน ${rangeLabel}` },
    { icon: CheckCircle2, label: "คลิปผ่านอนุมัติ", value: k.approvedClips.toLocaleString(), hint: `คลิป ใน ${rangeLabel}` },
    { icon: Sparkles, label: "ผ่านตั้งแต่รอบแรก", value: k.firstPassRate === null ? "–" : `${k.firstPassRate}%`, hint: "ของคลิปที่อนุมัติ" },
    { icon: Repeat, label: "ส่งเฉลี่ยต่อคลิป", value: k.avgRevisions === null ? "–" : `${k.avgRevisions.toFixed(1)} รอบ`, hint: "ก่อนผ่านอนุมัติ" },
    { icon: Timer, label: "เวลาจนผ่านอนุมัติ", value: formatHours(k.avgTurnaroundHours), hint: "นับจากส่งครั้งแรก" },
    { icon: Clock, label: isSelf ? "เวลารอตรวจเฉลี่ย" : "เวลาตรวจเฉลี่ย", value: formatHours(k.avgReviewHours), hint: "จากส่งงานถึงได้ผลตรวจ" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
            <t.icon size={14} className="text-slate-400" /> {t.label}
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900">{t.value}</div>
          <div className="text-[11px] text-slate-400">{t.hint}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Trend: two-series line chart with crosshair tooltip ───────────────── */

function TrendChart({ trend, granularity }: { trend: Overview["trend"]; granularity: "day" | "month" }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  // Draw at the container's real width so text keeps its size on phones.
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const height = 220;
  const pad = { top: 12, right: 56, bottom: 26, left: 32 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const max = Math.max(1, ...trend.map((t) => Math.max(t.submitted, t.approved)));
  const step = max <= 4 ? 1 : Math.ceil(max / 4);
  const yMax = step * Math.ceil(max / step);
  const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  const x = (i: number) => pad.left + (trend.length <= 1 ? innerW / 2 : (i / (trend.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / yMax) * innerH;
  const path = (keyName: "submitted" | "approved") => trend.map((t, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(t[keyName]).toFixed(1)}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(trend.length / Math.max(3, Math.floor(innerW / 70))));
  const totals = trend.reduce((acc, t) => ({ submitted: acc.submitted + t.submitted, approved: acc.approved + t.approved }), { submitted: 0, approved: 0 });
  const last = trend.length - 1;

  // Keep the two end labels from overlapping.
  const endY = { submitted: y(trend[last]?.submitted ?? 0), approved: y(trend[last]?.approved ?? 0) };
  if (Math.abs(endY.submitted - endY.approved) < 14) {
    const mid = (endY.submitted + endY.approved) / 2;
    const up = trend[last]?.submitted >= trend[last]?.approved ? "submitted" : "approved";
    endY[up] = mid - 7;
    endY[up === "submitted" ? "approved" : "submitted"] = mid + 7;
  }

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * innerW;
    const index = trend.length <= 1 ? 0 : Math.round((px / innerW) * (trend.length - 1));
    setHover(Math.min(trend.length - 1, Math.max(0, index)));
  };

  const hovered = hover === null ? null : trend[hover];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[12px] text-slate-600">
        <LegendLine color={SERIES.submitted} label="ส่งงาน" value={totals.submitted} />
        <LegendLine color={SERIES.approved} label="อนุมัติ" value={totals.approved} />
      </div>
      <div className="relative" ref={boxRef}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block max-w-full" role="img" aria-label="กราฟจำนวนการส่งงานและการอนุมัติตามช่วงเวลา">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={pad.left + innerW} y1={y(t)} y2={y(t)} stroke="#e4e4e7" strokeWidth={1} />
              <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#71717a">{t}</text>
            </g>
          ))}
          {trend.map((t, i) =>
            i % labelEvery === 0 || i === last ? (
              <text key={t.date} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill="#71717a">
                {formatBucket(t.date, granularity)}
              </text>
            ) : null,
          )}
          {hovered && hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="#a1a1aa" strokeWidth={1} />}
          <path d={path("submitted")} fill="none" stroke={SERIES.submitted} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <path d={path("approved")} fill="none" stroke={SERIES.approved} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && hovered && (
            <>
              <circle cx={x(hover)} cy={y(hovered.submitted)} r={4} fill={SERIES.submitted} stroke="#fff" strokeWidth={2} />
              <circle cx={x(hover)} cy={y(hovered.approved)} r={4} fill={SERIES.approved} stroke="#fff" strokeWidth={2} />
            </>
          )}
          {/* Direct labels at the line ends (text stays in ink colours). */}
          {last >= 0 && (
            <>
              <text x={x(last) + 8} y={endY.submitted + 4} fontSize={11} fill="#3f3f46">ส่งงาน</text>
              <text x={x(last) + 8} y={endY.approved + 4} fontSize={11} fill="#3f3f46">อนุมัติ</text>
            </>
          )}
          <rect
            x={pad.left}
            y={pad.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {hovered && hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-md"
            style={{ left: `${(x(hover) / width) * 100}%`, transform: x(hover) > width * 0.6 ? "translateX(calc(-100% - 12px))" : "translateX(12px)" }}
          >
            <div className="mb-1 font-semibold text-slate-500">{formatBucket(hovered.date, granularity)}</div>
            <TooltipRow color={SERIES.submitted} label="ส่งงาน" value={hovered.submitted} />
            <TooltipRow color={SERIES.approved} label="อนุมัติ" value={hovered.approved} />
          </div>
        )}
      </div>
      <button type="button" onClick={() => setShowTable((v) => !v)} className="mt-2 text-[12px] font-medium text-blue-700 hover:underline">
        {showTable ? "ซ่อนตาราง" : "ดูเป็นตาราง"}
      </button>
      {showTable && (
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr><th className="px-3 py-1.5 text-left">ช่วง</th><th className="px-3 py-1.5 text-right">ส่งงาน</th><th className="px-3 py-1.5 text-right">อนุมัติ</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trend.filter((t) => t.submitted || t.approved).map((t) => (
                <tr key={t.date}>
                  <td className="px-3 py-1.5 text-slate-700">{formatBucket(t.date, granularity)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-900">{t.submitted}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-900">{t.approved}</td>
                </tr>
              ))}
              {!trend.some((t) => t.submitted || t.approved) && (
                <tr><td colSpan={3} className="px-3 py-3 text-center text-slate-400">ไม่มีกิจกรรมในช่วงนี้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LegendLine({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
      {label} <b className="text-slate-900 tabular-nums">{value.toLocaleString()}</b>
    </span>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      <b className="tabular-nums text-slate-900">{value}</b>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

/* ─── Status snapshot: bar list keyed by the status badge ───────────────── */

function StatusBreakdown({ counts }: { counts: Record<string, number> }) {
  const entries = STATUS_ORDER.filter((s) => counts[s]).map((s) => [s, counts[s]] as const);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  if (!total) return <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีคลิป</p>;
  return (
    <ul className="space-y-3">
      {entries.map(([status, n]) => (
        <li key={status}>
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={status} />
            <span className="text-[13px] font-bold tabular-nums text-slate-900">
              {n} <span className="font-normal text-slate-400">({Math.round((n / total) * 100)}%)</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-slate-400" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
      <li className="border-t border-slate-100 pt-2 text-right text-[12px] text-slate-500">รวม {total} คลิป</li>
    </ul>
  );
}

/* ─── Project progress: stacked bars with per-segment hover ─────────────── */

const SEGMENTS = [
  { key: "done", label: "เสร็จแล้ว", color: SERIES.approved },
  { key: "inReview", label: "รอตรวจ", color: SERIES.submitted },
  { key: "needsRevision", label: "ต้องแก้ไข", color: SERIES.revision },
  { key: "notStarted", label: "ยังไม่ส่ง", color: SERIES.remaining },
] as const;

function ProjectProgress({ projects }: { projects: Overview["projects"] }) {
  const [tip, setTip] = useState<{ project: string; label: string; value: number; left: number; top: number } | null>(null);
  if (!projects.length) return <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีคลิปในโปรเจกต์</p>;
  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: s.color }} /> {s.label}
          </span>
        ))}
      </div>
      <ul className="space-y-3.5">
        {projects.map((p) => {
          const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
          return (
            <li key={p.id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate font-semibold text-slate-800">{p.name}</span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  <b className="text-slate-900">{p.done}</b>/{p.total} เสร็จ ({pct}%)
                </span>
              </div>
              <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
                {SEGMENTS.map((s) => {
                  const value = p[s.key];
                  if (!value) return null;
                  return (
                    <div
                      key={s.key}
                      tabIndex={0}
                      aria-label={`${p.name} ${s.label} ${value} คลิป`}
                      className="h-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-slate-900"
                      style={{ width: `${(value / p.total) * 100}%`, backgroundColor: s.color }}
                      onPointerEnter={(e) => {
                        const box = (e.currentTarget.offsetParent as HTMLElement | null)?.getBoundingClientRect();
                        const r = e.currentTarget.getBoundingClientRect();
                        setTip({ project: p.name, label: s.label, value, left: r.left - (box?.left ?? 0) + r.width / 2, top: r.top - (box?.top ?? 0) });
                      }}
                      onPointerLeave={() => setTip(null)}
                      onFocus={(e) => {
                        const box = (e.currentTarget.offsetParent as HTMLElement | null)?.getBoundingClientRect();
                        const r = e.currentTarget.getBoundingClientRect();
                        setTip({ project: p.name, label: s.label, value, left: r.left - (box?.left ?? 0) + r.width / 2, top: r.top - (box?.top ?? 0) });
                      }}
                      onBlur={() => setTip(null)}
                    />
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] shadow-md"
          style={{ left: tip.left, top: tip.top - 6 }}
        >
          <b className="tabular-nums text-slate-900">{tip.value}</b> <span className="text-slate-500">{tip.label}</span>
          <div className="max-w-[180px] truncate text-[11px] text-slate-400">{tip.project}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Tables ────────────────────────────────────────────────────────────── */

function EditorsTable({ editors }: { editors: Overview["editors"] }) {
  const maxApproved = useMemo(() => Math.max(1, ...editors.map((e) => e.approved)), [editors]);
  if (!editors.length) return <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีงานที่มอบหมาย</p>;
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[560px] text-[13px]">
        <thead className="text-left text-[12px] text-slate-500">
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2 font-semibold sm:pl-0">นักตัดต่อ</th>
            <th className="px-3 py-2 text-right font-semibold">งานที่ได้รับ</th>
            <th className="px-3 py-2 text-right font-semibold">ส่งงาน</th>
            <th className="px-3 py-2 font-semibold">ผ่านอนุมัติ</th>
            <th className="px-3 py-2 text-right font-semibold">ผ่านรอบแรก</th>
            <th className="px-3 py-2 text-right font-semibold">ส่งเฉลี่ย</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {editors.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-2.5 sm:pl-0">
                <div className="flex items-center gap-2">
                  <UserAvatar name={e.name} pictureUrl={e.pictureUrl} />
                  <span className="truncate font-semibold text-slate-800">{e.name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{e.assigned}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{e.submissions}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${(e.approved / maxApproved) * 100}%`, backgroundColor: SERIES.approved }} />
                  </div>
                  <b className="tabular-nums text-slate-900">{e.approved}</b>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{e.firstPassRate === null ? "–" : `${e.firstPassRate}%`}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{e.avgRevisions === null ? "–" : `${e.avgRevisions.toFixed(1)} รอบ`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewersTable({ reviewers }: { reviewers: Overview["reviewers"] }) {
  if (!reviewers.length) return <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีการตรวจในช่วงนี้</p>;
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[480px] text-[13px]">
        <thead className="text-left text-[12px] text-slate-500">
          <tr className="border-b border-slate-100">
            <th className="px-4 py-2 font-semibold sm:pl-0">ผู้ตรวจ</th>
            <th className="px-3 py-2 text-right font-semibold">ตรวจทั้งหมด</th>
            <th className="px-3 py-2 text-right font-semibold">อนุมัติ</th>
            <th className="px-3 py-2 text-right font-semibold">ส่งกลับแก้ไข</th>
            <th className="px-3 py-2 text-right font-semibold">เวลาตรวจเฉลี่ย</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reviewers.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2.5 sm:pl-0">
                <div className="flex items-center gap-2">
                  <UserAvatar name={r.name} pictureUrl={r.pictureUrl} />
                  <span className="truncate font-semibold text-slate-800">{r.name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-bold tabular-nums text-slate-900">{r.reviews}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.approved}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.sentBack}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{formatHours(r.avgReviewHours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
