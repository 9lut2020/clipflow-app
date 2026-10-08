import Link from "next/link";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { cn } from "@/utils/utils";

/* ─── Text building blocks ──────────────────────────────────────────────── */

export function H2({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xl font-bold text-slate-900 mt-12 mb-4 pb-2 border-b border-slate-200"
    >
      <a href={`#${id}`} className="hover:text-blue-700">
        {children}
      </a>
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-slate-900 mt-8 mb-3">{children}</h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-7 text-slate-700 my-3">{children}</p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 text-[15px] leading-7 text-slate-700 my-3">
      {children}
    </ul>
  );
}

export function DocLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
    >
      {children}
    </Link>
  );
}

/** Inline label for an on-screen button or menu item. */
export function UI({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[13px] font-semibold text-slate-800 shadow-2xs whitespace-nowrap">
      {children}
    </span>
  );
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
      {children}
    </code>
  );
}

const calloutStyles = {
  tip: {
    icon: Lightbulb,
    box: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-800",
    label: "เคล็ดลับ",
  },
  info: {
    icon: Info,
    box: "border-blue-200 bg-blue-50",
    title: "text-blue-800",
    label: "หมายเหตุ",
  },
  warn: {
    icon: AlertTriangle,
    box: "border-amber-200 bg-amber-50",
    title: "text-amber-800",
    label: "ข้อควรระวัง",
  },
};

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof calloutStyles;
  title?: string;
  children: React.ReactNode;
}) {
  const style = calloutStyles[type];
  const Icon = style.icon;
  return (
    <div className={cn("my-5 rounded-xl border p-4", style.box)}>
      <div
        className={cn("flex items-center gap-2 text-sm font-bold", style.title)}
      >
        <Icon size={16} /> {title || style.label}
      </div>
      <div className="mt-1.5 text-[14px] leading-6 text-slate-700">
        {children}
      </div>
    </div>
  );
}

/** Numbered how-to steps. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="my-5 space-y-5 [counter-reset:step]">{children}</ol>;
}

export function Step({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="relative pl-11 [counter-increment:step] before:absolute before:left-0 before:top-0 before:flex before:h-7 before:w-7 before:items-center before:justify-center before:rounded-full before:bg-blue-600 before:text-[13px] before:font-bold before:text-white before:content-[counter(step)]">
      <div className="font-bold text-slate-900 leading-7">{title}</div>
      {children && (
        <div className="text-[15px] leading-7 text-slate-700">{children}</div>
      )}
    </li>
  );
}

export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-[14px]">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-semibold whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Illustrations: simplified mock-ups of real ClipFlow screens ───────── */

/** A figure with a browser or phone frame around a mock screen. */
export function Figure({
  caption,
  url,
  device = "desktop",
  children,
}: {
  caption: string;
  url?: string;
  device?: "desktop" | "phone";
  children: React.ReactNode;
}) {
  return (
    <figure className="my-6">
      <div
        className={cn(
          "overflow-hidden border border-slate-300 bg-slate-50 shadow-sm",
          device === "phone"
            ? "mx-auto max-w-[300px] rounded-[28px] border-[6px] border-slate-800"
            : "rounded-xl",
        )}
      >
        {device === "desktop" ? (
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            {url && (
              <span className="ml-2 truncate rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                clipflow.fityatulhaq.org{url}
              </span>
            )}
          </div>
        ) : (
          <div className="flex justify-center bg-slate-800 pb-1">
            <span className="h-1.5 w-16 rounded-full bg-slate-600" />
          </div>
        )}
        <div className="p-3 sm:p-4" aria-hidden="true">
          {children}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-[13px] text-slate-500">
        {caption}
      </figcaption>
    </figure>
  );
}

/** Numbered marker that ties a spot in a figure to a step in the text. */
export function Mark({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white ring-2 ring-white shadow",
        className,
      )}
    >
      {n}
    </span>
  );
}

/** Highlights the part of a mock the reader should look at. */
export function Focus({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MockCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-2xs",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MockButton({
  children,
  tone = "primary",
  className,
}: {
  children: React.ReactNode;
  tone?: "primary" | "line" | "outline" | "danger" | "success" | "ghost";
  className?: string;
}) {
  const tones = {
    primary: "bg-blue-600 text-white",
    line: "bg-[#06C755] text-white",
    outline: "border border-slate-300 bg-white text-slate-700",
    danger: "bg-rose-600 text-white",
    success: "bg-emerald-600 text-white",
    ghost: "text-slate-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MockInput({
  label,
  value,
  placeholder,
}: {
  label?: string;
  value?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="text-[11px] font-bold text-slate-500">{label}</div>
      )}
      <div
        className={cn(
          "truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px]",
          value ? "text-slate-800" : "text-slate-400",
        )}
      >
        {value || placeholder}
      </div>
    </div>
  );
}

export function MockLines({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-2 rounded bg-slate-200"
          style={{ width: `${90 - i * 18}%` }}
        />
      ))}
    </div>
  );
}

/** LINE chat bubble for notification examples. */
export function LineBubble({
  title,
  color = "#2563EB",
  children,
}: {
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="px-3 py-2 text-[12px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      <div className="space-y-1.5 px-3 py-2.5 text-[12px] leading-5 text-slate-700">
        {children}
      </div>
    </div>
  );
}
