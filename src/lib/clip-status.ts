/**
 * Single source of truth for clip statuses: the label every page shows and
 * the stage of the pipeline it belongs to.
 *
 *   รอมอบหมาย → รอส่งงาน → รอตรวจ ⇄ ต้องแก้ไข → ผ่านแล้ว รอโพสต์ → เผยแพร่แล้ว
 *
 * "รอมอบหมาย" is not a DB status: it is a DRAFT clip with no owner yet, so
 * code that has the clip should use clipStageOf / clipMetaOf.
 *
 * Pages filter and group by stage, never by raw status, so a new raw status
 * (e.g. RESUBMITTED) can never fall into the wrong bucket again.
 */

export type ClipStage = "unassigned" | "todo" | "review" | "fix" | "ready" | "published" | "cancelled";

export const CLIP_STAGES: { id: ClipStage; label: string; hint: string }[] = [
  { id: "unassigned", label: "รอมอบหมาย", hint: "ยังไม่มีคนตัดต่อรับงาน" },
  { id: "todo", label: "รอส่งงาน", hint: "มอบหมายแล้ว ยังไม่ส่งคลิป" },
  { id: "review", label: "รอตรวจ", hint: "ส่งแล้ว รอผู้ตรวจ" },
  { id: "fix", label: "ต้องแก้ไข", hint: "ผู้ตรวจสั่งแก้ รอส่งใหม่" },
  { id: "ready", label: "ผ่านแล้ว รอโพสต์", hint: "ผ่านการตรวจ ยังไม่ได้โพสต์" },
  { id: "published", label: "เผยแพร่แล้ว", hint: "โพสต์แล้วอย่างน้อย 1 ช่องทาง" },
  { id: "cancelled", label: "ยกเลิก", hint: "" },
];

type StatusMeta = { label: string; stage: ClipStage; badge: string; dot: string; pulse?: boolean };

const STATUS_META: Record<string, StatusMeta> = {
  DRAFT: { label: "รอส่งงาน", stage: "todo", badge: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  PENDING_REVIEW: { label: "รอตรวจ", stage: "review", badge: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  IN_REVIEW: { label: "กำลังตรวจ", stage: "review", badge: "bg-sky-100 text-sky-800 border-sky-200", dot: "bg-sky-500", pulse: true },
  RESUBMITTED: { label: "ส่งแก้แล้ว รอตรวจ", stage: "review", badge: "bg-orange-100 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  NEEDS_REVISION: { label: "ต้องแก้ไข", stage: "fix", badge: "bg-rose-100 text-rose-800 border-rose-200", dot: "bg-rose-500" },
  APPROVED: { label: "ผ่านแล้ว รอโพสต์", stage: "ready", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  PUBLISHED: { label: "เผยแพร่แล้ว", stage: "published", badge: "bg-indigo-100 text-indigo-800 border-indigo-200", dot: "bg-indigo-500" },
  CANCELLED: { label: "ยกเลิก", stage: "cancelled", badge: "bg-gray-100 text-gray-500 border-gray-200", dot: "bg-gray-400" },
};

const UNASSIGNED_META: StatusMeta = { label: "รอมอบหมาย", stage: "unassigned", badge: "bg-violet-50 text-violet-700 border-violet-200 border-dashed", dot: "bg-violet-400" };

type ClipLike = { status?: string | null; ownerId?: string | null; owner?: { id?: string | null } | null };

/** Whether a clip has an editor; list rows carry `owner`, detail rows `ownerId`. */
export const hasOwner = (clip: ClipLike) => Boolean(clip.owner?.id || clip.ownerId);

/** Like clipStatusMeta, but a DRAFT nobody owns yet reads "รอมอบหมาย". */
export function clipMetaOf(clip: ClipLike): StatusMeta {
  const meta = clipStatusMeta(clip.status);
  return meta.stage === "todo" && !hasOwner(clip) ? UNASSIGNED_META : meta;
}

export function clipStageOf(clip: ClipLike): ClipStage {
  return clipMetaOf(clip).stage;
}

export function clipStatusMeta(status?: string | null): StatusMeta {
  return STATUS_META[status || ""] || STATUS_META.DRAFT;
}

export function clipStage(status?: string | null): ClipStage {
  return clipStatusMeta(status).stage;
}

/** Statuses that make up a stage — for API filters that take raw statuses. */
export function statusesOfStage(stage: ClipStage): string[] {
  return Object.entries(STATUS_META).filter(([, meta]) => meta.stage === stage).map(([status]) => status);
}

/** The editor still has to act (submit or fix). */
export const isEditorWork = (status?: string | null) => ["todo", "fix"].includes(clipStage(status));
/** Still moving through production (not yet passed review). */
export const isInProduction = (status?: string | null) => ["unassigned", "todo", "review", "fix"].includes(clipStage(status));
/** Passed review — approved or already published. */
export const isPassed = (status?: string | null) => ["ready", "published"].includes(clipStage(status));

/**
 * Label with posting progress for published clips, e.g. "เผยแพร่แล้ว 2/4".
 * `postedCount` is optional; without it the plain label is returned.
 */
export function clipStatusLabel(status?: string | null, postedCount?: number) {
  const meta = clipStatusMeta(status);
  if (meta.stage === "published" && postedCount !== undefined && postedCount > 0 && postedCount < 4) return `${meta.label} ${postedCount}/4`;
  return meta.label;
}
