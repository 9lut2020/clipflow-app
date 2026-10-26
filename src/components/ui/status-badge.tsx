import { clipStatusLabel, clipStatusMeta } from "@/lib/clip-status";

/** Clip status pill. Labels and colours come from lib/clip-status. */
export function StatusBadge({ status, postedCount, className = "" }: { status: string; postedCount?: number; className?: string }) {
  const meta = clipStatusMeta(status);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badge} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${meta.pulse ? "animate-pulse" : ""}`} />
      {clipStatusLabel(status, postedCount)}
    </span>
  );
}
