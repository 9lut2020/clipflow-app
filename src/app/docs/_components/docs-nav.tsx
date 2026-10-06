"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/utils/utils";

type NavGroup = { group: string; pages: { slug: string; title: string; description: string }[] };

function NavList({ groups, query, onNavigate }: { groups: NavGroup[]; query: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          pages: g.pages.filter((p) => !q || `${p.title} ${p.description} ${g.group}`.toLowerCase().includes(q)),
        }))
        .filter((g) => g.pages.length),
    [groups, q],
  );

  if (!filtered.length) return <p className="px-3 py-2 text-sm text-slate-500">ไม่พบหัวข้อที่ค้นหา</p>;

  return (
    <nav className="space-y-6">
      {filtered.map((g) => (
        <div key={g.group}>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.group}</div>
          <ul className="mt-2 space-y-0.5">
            {g.pages.map((p) => {
              const href = `/docs/${p.slug}`;
              const active = pathname === href;
              return (
                <li key={p.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-1.5 text-[14px] transition-colors",
                      active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">ค้นหาคู่มือ</span>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาหัวข้อ..."
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

/** Desktop sidebar plus a slide-in drawer on mobile. */
export function DocsNav({ groups }: { groups: NavGroup[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 pr-2">
          <div className="mb-5"><SearchBox value={query} onChange={setQuery} /></div>
          <NavList groups={groups} query={query} />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
      >
        <Menu size={16} /> สารบัญ
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button type="button" aria-label="ปิดสารบัญ" className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-slate-900">สารบัญคู่มือ</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="mb-5"><SearchBox value={query} onChange={setQuery} /></div>
            <NavList groups={groups} query={query} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
