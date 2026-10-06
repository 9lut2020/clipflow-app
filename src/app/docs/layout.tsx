import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsNav } from "./_components/docs-nav";
import { docGroups } from "./_content/registry";

export const metadata: Metadata = {
  title: { default: "คู่มือการใช้งาน | ClipFlow", template: "%s | คู่มือ ClipFlow" },
  description: "คู่มือการใช้งาน ClipFlow สำหรับนักตัดต่อ ผู้ตรวจ และแอดมิน",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  // Only plain data crosses into the client nav (no page components).
  const navGroups = docGroups.map((g) => ({
    group: g.group,
    pages: g.pages.map(({ slug, title, description }) => ({ slug, title, description })),
  }));

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link href="/docs" className="flex items-center gap-2">
            <Image src="/Image/Clipflow.png" alt="" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-slate-900">ClipFlow</span>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700">คู่มือ</span>
          </Link>
          <Link
            href="/dashboard"
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-bold text-white hover:bg-blue-700"
          >
            เข้าสู่ระบบ <ArrowRight size={14} />
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-10 px-4 py-8">
        <DocsNav groups={navGroups} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
