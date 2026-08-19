"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  SlidersHorizontal,
  Film,
  User as UserIcon,
  Clock,
  ExternalLink,
  Layers,
} from "lucide-react";

interface DashboardTableProps {
  clips: any[];
  isUser: boolean;
  role: string;
}

export default function DashboardTable({ clips, isUser, role }: DashboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter logic
  const filteredClips = clips.filter((clip) => {
    const projectName = clip.project?.name || "";
    const clipName = clip.name || clip.episode?.name || "";
    const ownerName = clip.owner?.displayName || "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      projectName.toLowerCase().includes(searchLower) ||
      clipName.toLowerCase().includes(searchLower) ||
      ownerName.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "ALL" ? true : clip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const UserAvatar = ({
    name,
    pictureUrl,
    size = "w-7 h-7",
  }: {
    name: string;
    pictureUrl?: string | null;
    size?: string;
  }) => {
    if (pictureUrl) {
      return (
        <img
          src={pictureUrl}
          alt={name}
          className={`${size} rounded-full object-cover border border-slate-200 shrink-0 shadow-xs`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-bold flex items-center justify-center shrink-0 border border-slate-200 shadow-xs text-[10px]`}
      >
        {name[0] || "?"}
      </div>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ผ่านอนุมัติ
        </span>
      );
    }
    if (status === "NEEDS_REVISION") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          สั่งแก้ไข
        </span>
      );
    }
    if (status === "IN_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          กำลังตรวจ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        รอตรวจทาน
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 md:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            รายการคลิปทั้งหมด
          </h2>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
            {filteredClips.length} รายการ
          </span>
        </div>

        {/* Filter Pills & Search Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Status Filter Dropdown / Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "ทั้งหมด" },
              { id: "PENDING_REVIEW", label: "รอตรวจ" },
              { id: "NEEDS_REVISION", label: "สั่งแก้" },
              { id: "APPROVED", label: "ผ่านอนุมัติ" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อคลิป..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto">
        {filteredClips.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs md:text-sm">
            ไม่พบรายการคลิปที่ตรงตามคำค้นหา
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-3.5">โปรเจกต์ & รายชื่อคลิป</th>
                {!isUser && <th className="px-6 py-3.5">ผู้รับผิดชอบ</th>}
                <th className="px-6 py-3.5">เวลาอัปเดตล่าสุด</th>
                <th className="px-6 py-3.5 text-center">สถานะ</th>
                <th className="px-6 py-3.5 text-right pr-6">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm divide-y divide-slate-100">
              {filteredClips.map((clip) => {
                const project = clip.project;
                const episode = clip.episode;
                const owner = clip.owner;

                const dateFormatted = clip.updatedAt || clip.submittedAt || clip.createdAt;
                const dateDisplay = dateFormatted
                  ? format(new Date(dateFormatted), "dd/MM/yyyy (HH:mm น.)")
                  : "-";

                return (
                  <tr
                    key={clip.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Project & Clip Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                          {project?.name || "โปรเจกต์ทั่วไป"}
                        </span>
                        <span className="text-slate-600 text-xs font-semibold">
                          EP.{episode?.episodeNo || 1}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {clip.name || episode?.name || "คลิปไม่มีชื่อ"}
                      </div>
                    </td>

                    {/* Owner / Creator (hidden for user role if redundant) */}
                    {!isUser && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={owner?.displayName || "ผู้ใช้"}
                            pictureUrl={owner?.pictureUrl}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {owner?.displayName || "ไม่ระบุชื่อ"}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Updated Timestamp */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>{dateDisplay}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={clip.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right pr-6">
                      <Link
                        href={`/clips/${clip.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/80 rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        ดูรายละเอียด
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 📱 MOBILE CARD VIEW (Block on mobile, hidden on desktop) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {filteredClips.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-medium text-xs">
            ไม่พบรายการคลิปที่ตรงตามเงื่อนไข
          </div>
        ) : (
          filteredClips.map((clip) => {
            const project = clip.project;
            const episode = clip.episode;
            const owner = clip.owner;

            const dateFormatted = clip.updatedAt || clip.submittedAt || clip.createdAt;
            const dateDisplay = dateFormatted
              ? format(new Date(dateFormatted), "dd/MM/yyyy HH:mm")
              : "-";

            return (
              <div key={clip.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                        {project?.name || "โปรเจกต์ทั่วไป"}
                      </span>
                      <span className="text-slate-600 text-xs font-bold">
                        EP.{episode?.episodeNo || 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {clip.name || episode?.name || "คลิปไม่มีชื่อ"}
                    </h3>
                  </div>
                  <StatusBadge status={clip.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <UserAvatar
                        name={owner?.displayName || "ผู้ใช้"}
                        pictureUrl={owner?.pictureUrl}
                        size="w-5 h-5"
                      />
                      <span className="font-semibold text-slate-700">
                        {owner?.displayName || "ไม่ระบุ"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 ml-auto">
                    <Clock size={12} className="text-slate-400" />
                    <span>{dateDisplay}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/clips/${clip.id}`}
                    className="w-full py-2 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-200 rounded-lg"
                  >
                    ดูรายละเอียดและตรวจคลิป <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
