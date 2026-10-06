"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Loader2, Scale, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/lib/api-client";
import { balanceAssignments, type BalanceMethod } from "@/lib/assignment-balancer";

export type WorkloadEntry = {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  role: "USER" | "REVIEWER" | "ADMIN";
  openTotal: number;
  openInProject: number;
  totalInProject: number;
};

type SheetClip = { id?: string; name?: string; episodeNo?: number; ownerId?: string; status?: string };

const CLOSED = ["APPROVED", "PUBLISHED", "CANCELLED"];
export const isOpenClip = (clip: SheetClip) => !CLOSED.includes(clip.status || "DRAFT");

export const fetchWorkload = async (url: string) => {
  const res = await apiClient.get<WorkloadEntry[]>(url);
  if (res.status !== "success" || !res.data) throw new Error(res.message || "โหลดภาระงานไม่สำเร็จ");
  return res.data;
};

type Scope = "unassigned" | "selected" | "notSubmitted";

const METHODS: { value: BalanceMethod; label: string; hint: string }[] = [
  { value: "load", label: "เกลี่ยตามภาระงาน", hint: "ให้คนที่งานค้างน้อยก่อน จนทุกคนใกล้เคียงกัน (แนะนำ)" },
  { value: "even", label: "แบ่งเท่ากัน", hint: "แจกคลิปชุดนี้ให้แต่ละคนจำนวนเท่ากัน ไม่สนงานค้างเดิม" },
  { value: "random", label: "สุ่มจับคู่", hint: "สุ่มคนรับแต่ละคลิป โดยจำนวนยังเท่ากัน" },
];

/**
 * Proposes an even assignment for a set of clips. The proposal is editable per
 * clip; "นำไปใช้ในตาราง" writes owners into the sheet, and the admin saves the
 * sheet as usual (so notifications go out once, on save).
 */
export function AssignmentBalancer({
  open,
  onOpenChange,
  projectId,
  clips,
  selectedIndexes,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clips: SheetClip[];
  selectedIndexes: Set<number>;
  onApply: (assignments: Map<number, string>) => void;
}) {
  const { data: workload, error, isLoading } = useSWR(open ? `/projects/${projectId}/workload` : null, fetchWorkload, {
    revalidateOnFocus: false,
  });

  const [scope, setScope] = useState<Scope>(selectedIndexes.size ? "selected" : "unassigned");
  const [method, setMethod] = useState<BalanceMethod>("load");
  const [seed, setSeed] = useState(1);
  const [editorIds, setEditorIds] = useState<string[] | null>(null);
  const [overrides, setOverrides] = useState<Map<number, string>>(new Map());

  // Reset per opening; default to editors (role USER), else everyone eligible.
  useEffect(() => {
    if (!open) return;
    setScope(selectedIndexes.size ? "selected" : "unassigned");
    setOverrides(new Map());
    setEditorIds(null);
  }, [open, selectedIndexes.size]);
  useEffect(() => {
    if (workload && editorIds === null) {
      const editors = workload.filter((w) => w.role === "USER").map((w) => w.id);
      setEditorIds(editors.length ? editors : workload.map((w) => w.id));
    }
  }, [workload, editorIds]);

  const scopeIndexes = useMemo(() => {
    const indexes: number[] = [];
    clips.forEach((clip, index) => {
      if (scope === "selected" ? selectedIndexes.has(index)
        : scope === "unassigned" ? isOpenClip(clip) && !clip.ownerId
        : (clip.status || "DRAFT") === "DRAFT") indexes.push(index);
    });
    return indexes;
  }, [clips, scope, selectedIndexes]);

  const counts = {
    unassigned: clips.filter((c) => isOpenClip(c) && !c.ownerId).length,
    selected: selectedIndexes.size,
    notSubmitted: clips.filter((c) => (c.status || "DRAFT") === "DRAFT").length,
  };

  const scopeSet = useMemo(() => new Set(scopeIndexes), [scopeIndexes]);
  const people = useMemo(() => workload ?? [], [workload]);

  // Open work outside this project (from the server) plus open clips in the
  // sheet that this run does not touch.
  const baseLoad = useMemo(() => {
    const map = new Map<string, number>();
    for (const person of people) map.set(person.id, Math.max(0, person.openTotal - person.openInProject));
    clips.forEach((clip, index) => {
      if (clip.ownerId && !scopeSet.has(index) && isOpenClip(clip) && map.has(clip.ownerId)) {
        map.set(clip.ownerId, map.get(clip.ownerId)! + 1);
      }
    });
    return map;
  }, [people, clips, scopeSet]);

  const currentLoad = useMemo(() => {
    const map = new Map<string, number>();
    for (const person of people) map.set(person.id, Math.max(0, person.openTotal - person.openInProject));
    clips.forEach((clip) => {
      if (clip.ownerId && isOpenClip(clip) && map.has(clip.ownerId)) map.set(clip.ownerId, map.get(clip.ownerId)! + 1);
    });
    return map;
  }, [people, clips]);

  const chosen = editorIds ?? [];
  const proposal = useMemo(() => {
    const auto = balanceAssignments({
      clipKeys: scopeIndexes,
      editors: chosen.map((id) => ({ id, baseLoad: baseLoad.get(id) ?? 0 })),
      method,
      seed,
    });
    for (const [index, owner] of overrides) if (scopeSet.has(index)) auto.set(index, owner);
    return auto;
  }, [scopeIndexes, chosen, baseLoad, method, seed, overrides, scopeSet]);

  const afterLoad = useMemo(() => {
    const map = new Map(baseLoad);
    for (const [index, owner] of proposal) {
      if (owner && isOpenClip(clips[index])) map.set(owner, (map.get(owner) ?? 0) + 1);
    }
    return map;
  }, [baseLoad, proposal, clips]);

  const maxLoad = Math.max(1, ...people.map((p) => Math.max(currentLoad.get(p.id) ?? 0, afterLoad.get(p.id) ?? 0)));
  const toggleEditor = (id: string) =>
    setEditorIds((prev) => (prev ?? []).includes(id) ? (prev ?? []).filter((x) => x !== id) : [...(prev ?? []), id]);

  const apply = () => {
    onApply(new Map(proposal));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale size={18} className="text-blue-600" /> จัดสรรงานให้เท่ากัน
          </DialogTitle>
          <DialogDescription>
            ระบบเสนอคนรับงานให้ แก้รายคลิปได้ แล้วกด “นำไปใช้ในตาราง” จากนั้นกดบันทึกทั้งหมดตามปกติ
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={16} /> กำลังโหลดภาระงาน…
          </div>
        )}
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">โหลดภาระงานไม่สำเร็จ ลองใหม่อีกครั้ง</p>}

        {workload && (
          <div className="space-y-5">
            {/* 1. Scope */}
            <section>
              <h3 className="mb-2 text-xs font-bold text-slate-500">1. คลิปที่จะจัดสรร</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ["unassigned", "ยังไม่มีคนรับ", counts.unassigned],
                  ["selected", "แถวที่ติ๊กเลือกไว้", counts.selected],
                  ["notSubmitted", "จัดใหม่ทั้งหมดที่ยังไม่ส่ง", counts.notSubmitted],
                ] as const).map(([value, label, n]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={n === 0}
                    onClick={() => { setScope(value); setOverrides(new Map()); }}
                    className={`rounded-xl border px-3 py-2 text-left text-[13px] transition-colors disabled:opacity-40 ${scope === value ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    <div className="font-semibold">{label}</div>
                    <div className="text-[12px] text-slate-500">{n} คลิป</div>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Who */}
            <section>
              <h3 className="mb-2 text-xs font-bold text-slate-500">2. คนรับงาน และภาระงานค้าง (เดิม → หลังจัด)</h3>
              <ul className="space-y-1.5">
                {people.map((person) => {
                  const checked = chosen.includes(person.id);
                  const before = currentLoad.get(person.id) ?? 0;
                  const after = afterLoad.get(person.id) ?? 0;
                  const delta = after - before;
                  return (
                    <li key={person.id}>
                      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${checked ? "border-slate-300 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleEditor(person.id)} className="h-4 w-4 accent-blue-600" />
                        <UserAvatar name={person.displayName} pictureUrl={person.pictureUrl} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-slate-800">
                            {person.displayName}
                            {person.role !== "USER" && <span className="ml-1.5 text-[10px] font-bold text-slate-400">{person.role}</span>}
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(after / maxLoad) * 100}%` }} />
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-[12px] tabular-nums">
                          <span className="text-slate-500">{before}</span>
                          <span className="mx-1 text-slate-300">→</span>
                          <b className="text-slate-900">{after}</b>
                          {delta !== 0 && (
                            <span className={`ml-1 font-semibold ${delta > 0 ? "text-blue-600" : "text-slate-500"}`}>
                              ({delta > 0 ? "+" : ""}{delta})
                            </span>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1.5 text-[11px] text-slate-400">งานค้าง = คลิปที่ยังไม่ผ่านอนุมัติ รวมทุกโปรเจกต์</p>
            </section>

            {/* 3. Method */}
            <section>
              <h3 className="mb-2 text-xs font-bold text-slate-500">3. วิธีจัด</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => { setMethod(m.value); setOverrides(new Map()); }}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${method === m.value ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <div className={`text-[13px] font-semibold ${method === m.value ? "text-blue-800" : "text-slate-800"}`}>{m.label}</div>
                    <div className="text-[11px] leading-4 text-slate-500">{m.hint}</div>
                  </button>
                ))}
              </div>
              {method === "random" && (
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { setSeed((s) => s + 1); setOverrides(new Map()); }}>
                  <Shuffle size={14} className="mr-1" /> สุ่มใหม่
                </Button>
              )}
            </section>

            {/* 4. Editable preview */}
            <section>
              <h3 className="mb-2 text-xs font-bold text-slate-500">4. ตรวจและแก้คนรับรายคลิป ({scopeIndexes.length})</h3>
              {!scopeIndexes.length ? (
                <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500">ไม่มีคลิปในกลุ่มที่เลือก</p>
              ) : !chosen.length ? (
                <p className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-800">เลือกคนรับงานอย่างน้อย 1 คน</p>
              ) : (
                <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                  {scopeIndexes.map((index) => {
                    const clip = clips[index];
                    const owner = proposal.get(index) ?? "";
                    const changed = (clip.ownerId || "") !== owner;
                    return (
                      <li key={index} className="flex items-center gap-2 px-3 py-2">
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">EP{clip.episodeNo}</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] text-slate-800">{clip.name}</span>
                        {changed && <span className="hidden shrink-0 text-[10px] font-bold text-blue-600 sm:inline">เปลี่ยน</span>}
                        <select
                          value={owner}
                          onChange={(e) => setOverrides((prev) => new Map(prev).set(index, e.target.value))}
                          className="w-36 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px]"
                          aria-label={`คนรับคลิป ${clip.name}`}
                        >
                          <option value="">— ไม่มอบหมาย —</option>
                          {people.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button
            type="button"
            onClick={apply}
            disabled={!workload || !scopeIndexes.length || !chosen.length}
            className="bg-blue-600 font-bold text-white hover:bg-blue-700"
          >
            นำไปใช้ในตาราง ({proposal.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Live "who holds how many clips" strip shown above the sheet. */
export function WorkloadStrip({
  projectId,
  clips,
  users,
}: {
  projectId: string;
  clips: SheetClip[];
  users: { id: string; displayName: string; pictureUrl?: string | null }[];
}) {
  const { data: workload } = useSWR(`/projects/${projectId}/workload`, fetchWorkload, { revalidateOnFocus: false });
  const rows = useMemo(() => {
    const byOwner = new Map<string, { open: number; total: number }>();
    for (const clip of clips) {
      if (!clip.ownerId) continue;
      const entry = byOwner.get(clip.ownerId) ?? { open: 0, total: 0 };
      entry.total += 1;
      if (isOpenClip(clip)) entry.open += 1;
      byOwner.set(clip.ownerId, entry);
    }
    return users
      .map((u) => {
        const w = workload?.find((x) => x.id === u.id);
        const inSheet = byOwner.get(u.id) ?? { open: 0, total: 0 };
        const otherOpen = w ? Math.max(0, w.openTotal - w.openInProject) : null;
        return { ...u, ...inSheet, otherOpen };
      })
      .filter((r) => r.total > 0 || (r.otherOpen ?? 0) > 0)
      .sort((a, b) => b.total - a.total);
  }, [clips, users, workload]);
  const unassigned = clips.filter((c) => !c.ownerId && isOpenClip(c)).length;
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 sm:px-3 hide-scrollbar">
      <span className="shrink-0 text-[11px] font-bold text-slate-500">ภาระงานในโปรเจกต์นี้</span>
      {rows.map((r) => (
        <div key={r.id} className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-0.5 pl-0.5 pr-2.5" title={`${r.displayName}: ${r.total} คลิปในโปรเจกต์นี้ (ค้าง ${r.open})${r.otherOpen !== null ? `, งานค้างโปรเจกต์อื่น ${r.otherOpen}` : ""}`}>
          <UserAvatar name={r.displayName} pictureUrl={r.pictureUrl} size="w-5 h-5" />
          <span className="max-w-[90px] truncate text-[12px] font-semibold text-slate-700">{r.displayName}</span>
          <span className="h-1.5 w-8 rounded-full bg-slate-200">
            <span className="block h-1.5 rounded-full bg-blue-500" style={{ width: `${(r.total / max) * 100}%` }} />
          </span>
          <b className="text-[12px] tabular-nums text-slate-900">{r.total}</b>
        </div>
      ))}
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${unassigned ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
        {unassigned ? `ยังไม่มีคนรับ ${unassigned}` : "มอบหมายครบแล้ว"}
      </span>
    </div>
  );
}
