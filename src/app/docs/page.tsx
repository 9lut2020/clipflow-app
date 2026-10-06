import Link from "next/link";
import { BookOpen, Clapperboard, Crown, LifeBuoy, Search } from "lucide-react";
import { docGroups } from "./_content/registry";

const groupIcons: Record<string, { icon: typeof BookOpen; color: string }> = {
  "เริ่มต้นใช้งาน": { icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  "สำหรับนักตัดต่อ": { icon: Clapperboard, color: "bg-violet-100 text-violet-700" },
  "สำหรับผู้ตรวจ": { icon: Search, color: "bg-sky-100 text-sky-700" },
  "สำหรับแอดมิน": { icon: Crown, color: "bg-amber-100 text-amber-700" },
  "ช่วยเหลือ": { icon: LifeBuoy, color: "bg-emerald-100 text-emerald-700" },
};

export default function DocsHome() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">คู่มือการใช้งาน ClipFlow</h1>
      <p className="mt-3 text-[16px] leading-7 text-slate-600">
        ทุกอย่างที่ต้องรู้เพื่อใช้งาน ClipFlow ตั้งแต่เข้าสู่ระบบครั้งแรก ส่งคลิป ตรวจงาน จนถึงมอบหมายงานและเผยแพร่
        เลือกหัวข้อตามบทบาทของคุณได้เลย
      </p>

      <Link
        href="/docs/getting-started"
        className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
      >
        เริ่มอ่านจากภาพรวม →
      </Link>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {docGroups.map(({ group, pages }) => {
          const meta = groupIcons[group] || groupIcons["เริ่มต้นใช้งาน"];
          return (
            <section key={group} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.color}`}>
                  <meta.icon size={18} />
                </span>
                <h2 className="font-bold text-slate-900">{group}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link href={`/docs/${page.slug}`} className="group block">
                      <div className="text-[14px] font-semibold text-slate-800 group-hover:text-blue-700">{page.title}</div>
                      <div className="text-[13px] text-slate-500">{page.description}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
