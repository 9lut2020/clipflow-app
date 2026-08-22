import React from "react";
import { PlatformType } from "@/types/api";

interface PlatformBadgeProps {
  platform?: PlatformType | string | null;
  className?: string;
  compact?: boolean;
}

export const PLATFORM_CONFIG: Record<
  string,
  { label: string; ratio: string; icon: string; bgClass: string; textClass: string; borderClass: string }
> = {
  TIKTOK: {
    label: "TikTok",
    ratio: "9:16",
    icon: "📱",
    bgClass: "bg-slate-900",
    textClass: "text-pink-400",
    borderClass: "border-slate-800",
  },
  YOUTUBE: {
    label: "YouTube Main",
    ratio: "16:9",
    icon: "🖥️",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
  },
  FB_REEL: {
    label: "FB Reel",
    ratio: "9:16",
    icon: "🎬",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
  },
  IG_SQUARE: {
    label: "IG Square",
    ratio: "1:1",
    icon: "📐",
    bgClass: "bg-purple-50",
    textClass: "text-purple-700",
    borderClass: "border-purple-200",
  },
  OTHER: {
    label: "อื่นๆ",
    ratio: "-",
    icon: "📹",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    borderClass: "border-slate-200",
  },
};

export default function PlatformBadge({ platform = "TIKTOK", className = "", compact = false }: PlatformBadgeProps) {
  const key = (platform || "TIKTOK").toUpperCase();
  const config = PLATFORM_CONFIG[key] || PLATFORM_CONFIG.TIKTOK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border shadow-2xs ${config.bgClass} ${config.textClass} ${config.borderClass} ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      } ${className}`}
    >
      <span>{config.icon}</span>
      {!compact && <span>{config.label}</span>}
      {compact && <span className="max-sm:hidden">{config.label}</span>}
      {!compact && <span className="opacity-75 font-mono text-[10px]">({config.ratio})</span>}
    </span>
  );
}
