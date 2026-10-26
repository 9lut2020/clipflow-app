import { clipMetaOf, clipStatusLabel } from "@/lib/clip-status";

/**
 * Clip status pill. Labels and colours come from lib/clip-status. Pass
 * `assigned={false}` for a draft with no editor so it reads "รอมอบหมาย".
 */
export function StatusBadge({ status, postedCount, assigned = true, className = "" }: { status: string; postedCount?: number; assigned?: boolean; className?: string }) {
  const meta = clipMetaOf({ status, ownerId: assigned ? "assigned" : null });
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${meta.pulse ? "animate-pulse" : ""}`} />
      {meta.stage === "unassigned" ? meta.label : clipStatusLabel(status, postedCount)}
    </span>
  );
}
