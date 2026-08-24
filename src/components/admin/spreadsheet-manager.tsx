"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useBatchCreateClips } from "@/features/clips/hooks/use-clips";
import {
  Save,
  Plus,
  Trash2,
  FileText,
  X,
  ChevronDown,
  Loader2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PLATFORM_CONFIG } from "@/components/ui/platform-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";

interface SpreadsheetManagerProps {
  projectId: string;
  initialClips: any[];
  initialEpisodes?: any[];
  users: any[];
}

// AssigneeDropdown code here (Unchanged)
const AssigneeDropdown = ({
  users,
  value,
  onChange,
  onApplyToAllBelow,
}: {
  users: any[];
  value: string;
  onChange: (val: string) => void;
  onApplyToAllBelow?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedUser = users.find((u) => u.id === value);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const isUp = spaceBelow < 250; // if less than 250px below, open upwards

        setDropdownStyle({
          position: "fixed",
          top: isUp ? "auto" : rect.bottom + 4,
          bottom: isUp ? window.innerHeight - rect.top + 4 : "auto",
          left: rect.left,
          width: Math.max(rect.width, 256), // at least 256px
          zIndex: 99999,
        });
      };

      updatePosition();

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open]);

  return (
    <div
      className={`relative w-full h-full min-w-[180px] ${open ? "z-50" : "z-auto"}`}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-full min-h-[38px] px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedUser ? (
            <>
              {selectedUser.pictureUrl ? (
                <img
                  src={selectedUser.pictureUrl}
                  className="w-6 h-6 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {selectedUser.displayName[0]}
                </div>
              )}
              <span className="text-sm font-bold text-slate-700 truncate">
                {selectedUser.displayName}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-400">
              เลือกคนตัดต่อ...
            </span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[99990]"
              onClick={() => setOpen(false)}
            />
            <div
              style={dropdownStyle}
              className="bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50 transition-colors font-medium border-b border-slate-100"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                - ไม่ระบุคนตัดต่อ -
              </button>
              {value && onApplyToAllBelow && (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 font-bold border-b border-slate-100 flex items-center gap-2"
                  onClick={() => {
                    onApplyToAllBelow();
                    setOpen(false);
                  }}
                >
                  <ChevronDown size={14} /> นำไปใช้กับรายการด้านล่างทั้งหมด
                </button>
              )}
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-indigo-50 transition-colors ${value === u.id ? "bg-indigo-50/50" : ""}`}
                  onClick={() => {
                    onChange(u.id);
                    setOpen(false);
                  }}
                >
                  {u.pictureUrl ? (
                    <img
                      src={u.pictureUrl}
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                      {u.displayName[0]}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {u.displayName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate uppercase">
                      {u.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default function SpreadsheetManager({
  projectId,
  initialClips,
  initialEpisodes = [],
  users,
}: SpreadsheetManagerProps) {
  const router = useRouter();
  const { batchCreateClips, isSaving } = useBatchCreateClips();
  const [clips, setClips] = useState<any[]>(initialClips);
  const [episodes, setEpisodes] = useState<any[]>(initialEpisodes);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Add Episode Modal States
  const [showAddEpisodeModal, setShowAddEpisodeModal] = useState(false);
  const [newEpisodeNo, setNewEpisodeNo] = useState<number | "">("");
  const [newEpisodeName, setNewEpisodeName] = useState("");
  const [isCreatingEpisode, setIsCreatingEpisode] = useState(false);

  // Dialog States
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);
  const [isDeletingRow, setIsDeletingRow] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<any | null>(null);
  const [isDeletingEpisode, setIsDeletingEpisode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [applyAllConfig, setApplyAllConfig] = useState<{
    index: number;
    userId: string;
  } | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEpisode, setFilterEpisode] = useState<string>("ALL");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");

  const filteredClips = clips.filter((clip) => {
    if (
      searchQuery &&
      !clip.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filterEpisode !== "ALL" && clip.episodeNo?.toString() !== filterEpisode)
      return false;
    if (
      filterAssignee !== "ALL" &&
      (clip.ownerId || "") !==
        (filterAssignee === "UNASSIGNED" ? "" : filterAssignee)
    )
      return false;
    return true;
  });

  const handleAddRow = () => {
    setClips([
      ...clips,
      {
        id: `new-${Date.now()}`,
        episodeNo:
          clips.length > 0
            ? clips[clips.length - 1].episodeNo
            : episodes.length > 0
              ? episodes[episodes.length - 1].episodeNo
              : 1,
        name: "",
        description: "",
        ownerId: "",
        platform: "TIKTOK",
        status: "DRAFT",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const clip = clips[index];
    if (clip.id && !clip.id.toString().startsWith("new-")) {
      setRowToDelete(index);
    } else {
      const newClips = [...clips];
      newClips.splice(index, 1);
      setClips(newClips);
    }
  };

  const confirmRemoveRow = async () => {
    if (rowToDelete === null) return;
    const index = rowToDelete;
    const clip = clips[index];

    setIsDeletingRow(true);
    try {
      const result = await api.delete(`/clips/${clip.id}`);
      if (result.status !== "success") {
        toast.error(`ลบไม่สำเร็จ: ${result.message || "Unknown error"}`);
        setIsDeletingRow(false);
        return;
      }
      toast.success("ลบแถวเรียบร้อยแล้ว");
      const newClips = [...clips];
      newClips.splice(index, 1);
      setClips(newClips);
      setRowToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeletingRow(false);
    }
  };

  const confirmDeleteSelected = async () => {
    setIsDeletingRow(true);
    try {
      const rows = Array.from(selectedRows).sort((a, b) => b - a); // Sort descending
      const savedIds = rows
        .map((index) => clips[index].id)
        .filter((id) => id && !id.toString().startsWith("new-"));

      // Delete saved clips one by one (could be optimized with a batch endpoint later)
      for (const id of savedIds) {
        const res = await api.delete(`/clips/${id}`);
        if (res.status !== "success") throw new Error(res.message);
      }

      const newClips = [...clips];
      for (const index of rows) {
        newClips.splice(index, 1);
      }
      setClips(newClips);
      setSelectedRows(new Set());
      setShowMultiDeleteModal(false);
      toast.success(`ลบ ${rows.length} แถวเรียบร้อยแล้ว`);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeletingRow(false);
    }
  };

  const confirmDeleteEpisode = async () => {
    if (!episodeToDelete) return;
    setIsDeletingEpisode(true);
    try {
      const res = await api.delete(`/episodes/${episodeToDelete.id}`);
      if (res.status === "success") {
        setEpisodes(episodes.filter((ep) => ep.id !== episodeToDelete.id));
        if (filterEpisode === episodeToDelete.episodeNo.toString()) {
          setFilterEpisode("ALL");
        }
        toast.success("ลบตอนเรียบร้อยแล้ว");
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการลบตอน");
    } finally {
      setIsDeletingEpisode(false);
      setEpisodeToDelete(null);
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newClips = [...clips];
    newClips[index][field] =
      field === "episodeNo" ? parseInt(value) || 0 : value;
    setClips(newClips);
  };

  const handleApplyToAllBelow = (index: number, userId: string) => {
    setApplyAllConfig({ index, userId });
  };

  const confirmApplyAll = () => {
    if (!applyAllConfig) return;
    const { index, userId } = applyAllConfig;
    const newClips = [...clips];
    const targetUserId = userId;
    for (let i = index; i < newClips.length; i++) {
      newClips[i].ownerId = targetUserId;
    }
    setClips(newClips);
    setApplyAllConfig(null);
  };

  const handleSave = async () => {
    const invalidRows = clips.filter((c) => !c.name || !c.episodeNo);
    if (invalidRows.length > 0) {
      toast.error("กรุณากรอกชื่อคลิปและตอน (EP) ให้ครบถ้วน");
      return;
    }

    try {
      const result = await batchCreateClips(projectId, clips);
      if (result.status === "success") {
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
        router.refresh();
      } else {
        toast.error(`Failed to save: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "An error occurred");
    }
  };

  const handleCreateEpisode = async () => {
    if (!newEpisodeNo) return;

    // Prevent duplicate EP numbers
    if (episodes.some((ep) => ep.episodeNo === Number(newEpisodeNo))) {
      toast.error(`มีตอนที่ ${newEpisodeNo} อยู่แล้ว กรุณาใช้เลขตอนอื่น`);
      return;
    }

    setIsCreatingEpisode(true);
    try {
      const res = await api.post(`/projects/${projectId}/episodes`, {
        episodeNo: Number(newEpisodeNo),
        name: newEpisodeName || undefined,
      });
      if (res.status === "success") {
        toast.success("เพิ่มตอนเรียบร้อยแล้ว");
        setEpisodes(
          [...episodes, res.data].sort((a, b) => a.episodeNo - b.episodeNo),
        );
        setShowAddEpisodeModal(false);
        setNewEpisodeNo("");
        setNewEpisodeName("");
        router.refresh();
      } else {
        toast.error(res.message || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มตอน");
    } finally {
      setIsCreatingEpisode(false);
    }
  };

  const handleImportParse = () => {
    if (!importText.trim()) return;

    const lines = importText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const newClips: any[] = [];

    let currentEpisode =
      clips.length > 0
        ? clips[clips.length - 1].episodeNo
        : episodes.length > 0
          ? episodes[episodes.length - 1].episodeNo
          : 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Update current episode if found
      const epMatch = line.match(/(?:อีพี|EP|ep)[\s\.]*(\d+)/i);
      if (epMatch) {
        currentEpisode = parseInt(epMatch[1]);
      }

      // Detect start of a clip block
      if (
        line.match(/คลิป\s*\d+/i) ||
        line.startsWith("ไฮไลท์") ||
        line.startsWith('"')
      ) {
        let name = line;
        let timeNote = "";

        // If the current line is just a header (like "ไฮไลท์อีพี 6 คลิป 1"), the next line might be the title
        if (
          (line.match(/คลิป\s*\d+/i) || line.startsWith("ไฮไลท์")) &&
          !line.includes('"')
        ) {
          if (i + 1 < lines.length && lines[i + 1].startsWith('"')) {
            name = lines[i + 1];
            i++;
          }
        }

        // Clean up quotes
        name = name.replace(/"/g, "").trim();

        // Look ahead for time/notes
        if (
          i + 1 < lines.length &&
          (lines[i + 1].includes("เวลา") || lines[i + 1].includes("🕣"))
        ) {
          timeNote = lines[i + 1].replace("🕣", "").trim();
          i++;
        }

        const finalName = name;

        // Prevent duplicate appending if we somehow matched the same thing twice (very basic check)
        newClips.push({
          id: `new-${Date.now()}-${newClips.length}`,
          episodeNo: currentEpisode,
          name: finalName,
          description: timeNote,
          ownerId: "",
          status: "DRAFT",
        });
      }
    }

    if (newClips.length > 0) {
      setClips([...clips, ...newClips]);
      toast.success(`นำเข้าสำเร็จ ${newClips.length} คลิป`);
    } else {
      toast.error("ไม่พบรูปแบบที่สามารถนำเข้าได้ กรุณาตรวจสอบข้อความ");
    }

    setShowImportModal(false);
    setImportText("");
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] w-full min-w-0 overflow-hidden">
      {/* Toolbar */}
      <div className="p-2 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowAddEpisodeModal(true)}
            variant="outline"
            size="sm"
            className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border-blue-200 px-2 sm:px-3 h-8 sm:h-9"
          >
            <Layers size={14} className="shrink-0" />{" "}
            <span className="text-xs sm:text-sm whitespace-nowrap ml-1 sm:ml-1.5">
              จัดการตอน
            </span>
          </Button>
          <div className="w-px h-5 sm:h-6 bg-slate-300 mx-0.5"></div>
          <Button
            onClick={handleAddRow}
            variant="outline"
            size="sm"
            className="shrink-0 bg-white hover:bg-slate-100 text-slate-700 font-bold border-slate-300 px-2 sm:px-3 h-8 sm:h-9"
          >
            <Plus size={14} className="shrink-0" />{" "}
            <span className="text-xs sm:text-sm whitespace-nowrap ml-1 sm:ml-1.5 hidden sm:inline">
              เพิ่มแถว
            </span>
            <span className="text-xs whitespace-nowrap ml-1 inline sm:hidden">
              เพิ่ม
            </span>
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            size="sm"
            className="shrink-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border-indigo-200 flex px-2 sm:px-3 h-8 sm:h-9"
          >
            <FileText size={14} className="shrink-0" />{" "}
            <span className="text-xs sm:text-sm whitespace-nowrap ml-1 sm:ml-1.5 hidden sm:inline">
              วางข้อความอัตโนมัติ
            </span>
            <span className="text-xs whitespace-nowrap ml-1 inline sm:hidden">
              นำเข้า
            </span>
          </Button>
          {selectedRows.size > 0 && (
            <Button
              onClick={() => setShowMultiDeleteModal(true)}
              variant="destructive"
              size="sm"
              className="shrink-0 font-bold flex shadow-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <Trash2 size={14} className="shrink-0" />
              <span className="whitespace-nowrap hidden sm:inline ml-1.5">
                ลบ {selectedRows.size} รายการ
              </span>
              <span className="whitespace-nowrap inline sm:hidden ml-1 text-xs">
                ลบ {selectedRows.size}
              </span>
            </Button>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-9 sm:h-8 px-4"
        >
          {isSaving ? (
            <>
              <Loader2
                size={14}
                className="mr-1 sm:mr-1.5 shrink-0 animate-spin"
              />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                กำลังบันทึก...
              </span>
            </>
          ) : (
            <>
              <Save size={14} className="mr-1 sm:mr-1.5 shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                บันทึกทั้งหมด
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="p-2 sm:p-3 bg-white border-b border-slate-200 flex gap-1 sm:gap-2 items-center hide-scrollbar">
        <div className="flex-1 min-w-[100px] sm:min-w-[140px]">
          <input
            type="text"
            placeholder="ค้นหาชื่อคลิป..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <select
            value={filterEpisode}
            onChange={(e) => setFilterEpisode(e.target.value)}
            className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">ทุกตอน</option>
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.episodeNo}>
                EP. {ep.episodeNo}
              </option>
            ))}
          </select>
        </div>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">ทุกคน</option>
          <option value="UNASSIGNED">- ยังไม่มอบหมาย -</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-auto flex-1 bg-slate-100">
        <table className="w-full border-collapse text-sm whitespace-nowrap min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-blue-100 text-blue-900 border-b-2 border-blue-200 shadow-sm">
            <tr>
              <th className="px-3 py-2 border-r border-blue-200 font-bold w-[40px] text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === filteredClips.length &&
                    filteredClips.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSet = new Set(
                        filteredClips.map((_, i) =>
                          clips.findIndex((c) => c.id === filteredClips[i].id),
                        ),
                      );
                      setSelectedRows(newSet);
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold w-[50px] text-center">
                ลำดับ
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold text-left min-w-[200px]">
                ชื่อคลิป
              </th>
              <th className="hidden md:table-cell px-3 py-2 border-r border-blue-200 font-bold text-left min-w-[250px]">
                รายละเอียด
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold w-[120px] text-left">
                ตอน (Episode)
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold text-left w-[220px]">
                ผู้รับผิดชอบ
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold text-left w-[130px]">
                แพลตฟอร์ม
              </th>
              <th className="px-3 py-2 font-bold w-[50px] text-center"></th>
            </tr>
          </thead>
          <tbody>
            {clips.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-slate-400 bg-white"
                >
                  ยังไม่มีข้อมูลคลิป กดปุ่ม "เพิ่มแถว" เพื่อเริ่มสร้าง
                </td>
              </tr>
            ) : (
              filteredClips.map((clip, filteredIndex) => {
                const index = clips.findIndex((c) => c.id === clip.id);
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={clip.id || index}
                    className={`${isEven ? "bg-white" : "bg-slate-50"} hover:bg-blue-50/50 transition-colors group focus-within:relative focus-within:z-50 hover:relative hover:z-40 ${selectedRows.has(index) ? "bg-blue-50/80" : ""}`}
                  >
                    <td className="px-3 py-1.5 border-r border-b border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => {
                          const newSet = new Set(selectedRows);
                          if (e.target.checked) {
                            newSet.add(index);
                          } else {
                            newSet.delete(index);
                          }
                          setSelectedRows(newSet);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-1.5 border-r border-b border-slate-200 text-center text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="border-r border-b border-slate-200 p-0">
                      <input
                        type="text"
                        value={clip.name}
                        onChange={(e) =>
                          handleChange(index, "name", e.target.value)
                        }
                        placeholder="ชื่อคลิป..."
                        className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all font-medium text-slate-800"
                      />
                    </td>
                    <td className="hidden md:table-cell border-r border-b border-slate-200 p-0">
                      <input
                        type="text"
                        value={clip.description || ""}
                        onChange={(e) =>
                          handleChange(index, "description", e.target.value)
                        }
                        placeholder="รายละเอียด (เช่น เวลาเริ่ม-จบ)..."
                        className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all text-slate-600 text-sm"
                      />
                    </td>
                    <td className="border-r border-b border-slate-200 p-0 relative">
                      <select
                        value={clip.episodeNo || ""}
                        onChange={(e) =>
                          handleChange(index, "episodeNo", e.target.value)
                        }
                        className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all font-bold text-blue-600 cursor-pointer appearance-none"
                      >
                        <option value="" disabled>
                          เลือกตอน...
                        </option>
                        {episodes.map((ep) => (
                          <option key={ep.id} value={ep.episodeNo}>
                            EP. {ep.episodeNo}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </td>
                    <td className="border-r border-b border-slate-200 p-0">
                      <AssigneeDropdown
                        users={users}
                        value={clip.ownerId || ""}
                        onChange={(val) => handleChange(index, "ownerId", val)}
                        onApplyToAllBelow={() =>
                          handleApplyToAllBelow(index, clip.ownerId)
                        }
                      />
                    </td>
                    <td className="border-r border-b border-slate-200 p-0">
                      <select
                        value={clip.platform || "TIKTOK"}
                        onChange={(e) =>
                          handleChange(index, "platform", e.target.value)
                        }
                        className="w-full h-full px-2 py-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all text-xs font-bold cursor-pointer"
                      >
                        {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>
                            {cfg.icon} {cfg.label} ({cfg.ratio})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-slate-200 p-0 text-center">
                      <button
                        onClick={() => handleRemoveRow(index)}
                        className="w-full h-full py-2 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="ลบแถว"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Manage Episodes Modal */}
      {isDesktop ? (
        <Dialog
          open={showAddEpisodeModal}
          onOpenChange={setShowAddEpisodeModal}
        >
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>จัดการตอน (Episodes)</DialogTitle>
              <DialogDescription>เพิ่มหรือลบตอนในโปรเจกต์นี้</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-2 space-y-6 px-1">
              {episodes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    ตอนที่มีอยู่
                  </label>
                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto rounded-lg border border-slate-200 p-2 bg-slate-50">
                    {episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex items-center justify-between bg-white p-2.5 rounded-md border border-slate-100 shadow-sm"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          EP. {ep.episodeNo}{" "}
                          {ep.name ? (
                            <span className="text-slate-500 font-medium ml-1">
                              {" "}
                              - {ep.name}
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                          onClick={() => setEpisodeToDelete(ep)}
                          title="ลบตอนนี้"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Plus size={16} className="mr-1 text-blue-600" />
                  เพิ่มตอนใหม่
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="หมายเลขตอน (เช่น 1, 2, 3) *"
                    value={newEpisodeNo}
                    onChange={(e) =>
                      setNewEpisodeNo(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="border-slate-300 focus:border-blue-500"
                  />
                  <Input
                    placeholder="ชื่อตอน (ไม่บังคับ) เช่น จุดเริ่มต้น..."
                    value={newEpisodeName}
                    onChange={(e) => setNewEpisodeName(e.target.value)}
                    className="border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEpisodeModal(false)}
              >
                ปิดหน้าต่าง
              </Button>
              <Button
                type="button"
                onClick={handleCreateEpisode}
                disabled={!newEpisodeNo || isCreatingEpisode}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingEpisode ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                บันทึกตอนใหม่
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={showAddEpisodeModal}
          onOpenChange={setShowAddEpisodeModal}
        >
          <DrawerContent className="max-h-[90vh] flex flex-col overflow-hidden">
            <DrawerHeader className="text-left shrink-0">
              <DrawerTitle>จัดการตอน (Episodes)</DrawerTitle>
              <DrawerDescription>เพิ่มหรือลบตอนในโปรเจกต์นี้</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto flex-1 space-y-6 pb-4">
              {episodes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    ตอนที่มีอยู่
                  </label>
                  <div className="space-y-2 bg-slate-50 rounded-lg p-2 border border-slate-100 max-h-[250px] overflow-y-auto">
                    {episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex items-center justify-between bg-white p-2.5 rounded-md border border-slate-200 shadow-sm"
                      >
                        <span className="text-sm font-bold text-slate-700">
                          EP. {ep.episodeNo}{" "}
                          {ep.name ? (
                            <span className="text-slate-500 font-medium ml-1">
                              {" "}
                              - {ep.name}
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                          onClick={() => setEpisodeToDelete(ep)}
                          title="ลบตอนนี้"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Plus size={16} className="mr-1 text-blue-600" />
                  เพิ่มตอนใหม่
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="หมายเลขตอน (เช่น 1, 2, 3) *"
                    value={newEpisodeNo}
                    onChange={(e) =>
                      setNewEpisodeNo(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  />
                  <Input
                    placeholder="ชื่อตอน (ไม่บังคับ) เช่น จุดเริ่มต้น..."
                    value={newEpisodeName}
                    onChange={(e) => setNewEpisodeName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DrawerFooter className="shrink-0 border-t border-slate-100">
              <Button
                type="button"
                onClick={handleCreateEpisode}
                disabled={!newEpisodeNo || isCreatingEpisode}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreatingEpisode ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                บันทึกตอนใหม่
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddEpisodeModal(false)}
              >
                ปิด
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={rowToDelete !== null}
        onOpenChange={(open) => !open && setRowToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">ยืนยันการลบแถว</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบแถวนี้? หากคลิปนี้ถูกบันทึกไปแล้ว
              ข้อมูลจะถูกลบออกจากระบบทันที
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {rowToDelete !== null && clips[rowToDelete]?.name && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700 truncate">
                {clips[rowToDelete].name}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRowToDelete(null)}
              disabled={isDeletingRow}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmRemoveRow}
              disabled={isDeletingRow}
            >
              {isDeletingRow ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> กำลังลบ...
                </>
              ) : (
                "ลบข้อมูล"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Episode Confirmation Modal */}
      <Dialog
        open={episodeToDelete !== null}
        onOpenChange={(open) => !open && setEpisodeToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">ยืนยันการลบตอน</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบตอนนี้? ระวัง:
              คลิปที่อ้างอิงถึงตอนนี้อาจได้รับผลกระทบ!
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {episodeToDelete && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-700 truncate">
                EP. {episodeToDelete.episodeNo}{" "}
                {episodeToDelete.name ? `: ${episodeToDelete.name}` : ""}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEpisodeToDelete(null)}
              disabled={isDeletingEpisode}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteEpisode}
              disabled={isDeletingEpisode}
            >
              {isDeletingEpisode ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> กำลังลบ...
                </>
              ) : (
                "ลบข้อมูล"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multi-Delete Confirmation Modal */}
      <Dialog
        open={showMultiDeleteModal}
        onOpenChange={(open) => !open && setShowMultiDeleteModal(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">
              ยืนยันการลบหลายรายการ
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลที่เลือกทั้งหมด{" "}
              {selectedRows.size} รายการ? หากคลิปใดถูกบันทึกไปแล้ว
              ข้อมูลจะถูกลบออกจากระบบทันที
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMultiDeleteModal(false)}
              disabled={isDeletingRow}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteSelected}
              disabled={isDeletingRow}
            >
              {isDeletingRow ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> กำลังลบ...
                </>
              ) : (
                "ลบข้อมูลทั้งหมด"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply All Confirmation Modal */}
      <Dialog
        open={applyAllConfig !== null}
        onOpenChange={(open) => !open && setApplyAllConfig(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ยืนยันการนำไปใช้ทั้งหมด</DialogTitle>
            <DialogDescription>
              ระบบจะกำหนดผู้รับผิดชอบให้กับคลิปทั้งหมดในรายการที่อยู่ด้านล่างแถวนี้
              คุณต้องการดำเนินการต่อหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplyAllConfig(null)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={confirmApplyAll}
            >
              ยืนยันการทำรายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Auto Modal */}
      {isDesktop ? (
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>วางข้อความอัตโนมัติ (Import)</DialogTitle>
              <DialogDescription>
                คัดลอกข้อความสรุปคลิปมาวางที่นี่
                ระบบจะพยายามแยกข้อมูลให้เป็นแถวอัตโนมัติ
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50"
                placeholder='ตัวอย่าง:
  อีพี 6
  ไฮไลท์อีพี 6 คลิป 1
  "จุดเริ่มต้นของความสำเร็จ"
  🕣 เวลา: 10:05 - 11:30'
              />
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl text-xs flex gap-2 items-start">
                <FileText size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>คำแนะนำ:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>ระบบจะตรวจจับคำว่า "อีพี X" เพื่อหาหมายเลขตอน</li>
                    <li>
                      ตรวจจับ "ไฮไลท์..." "คลิป X" หรือข้อความในเครื่องหมาย
                      "คำพูด" เพื่อดึงชื่อคลิป
                    </li>
                    <li>เวลา (มีไอคอน 🕣) จะถูกดึงไปใส่ในช่องรายละเอียด</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImportModal(false)}
              >
                ยกเลิก
              </Button>
              <Button type="button" onClick={handleImportParse}>
                นำเข้าข้อมูล
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={showImportModal} onOpenChange={setShowImportModal}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>วางข้อความอัตโนมัติ (Import)</DrawerTitle>
              <DrawerDescription>
                คัดลอกข้อความสรุปคลิปมาวางที่นี่
                ระบบจะพยายามแยกข้อมูลให้เป็นแถวอัตโนมัติ
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 py-4 space-y-4">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-48 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50"
                placeholder='ตัวอย่าง:
  อีพี 6
  ไฮไลท์อีพี 6 คลิป 1
  "จุดเริ่มต้นของความสำเร็จ"
  🕣 เวลา: 10:05 - 11:30'
              />
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl text-xs flex gap-2 items-start">
                <FileText size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>คำแนะนำ:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>ตรวจจับคำว่า "อีพี X" เป็นหมายเลขตอน</li>
                    <li>ตรวจจับข้อความใน "คำพูด" เป็นชื่อคลิป</li>
                    <li>เวลาจะดึงไปใส่ในรายละเอียดอัตโนมัติ</li>
                  </ul>
                </div>
              </div>
            </div>

            <DrawerFooter className="pt-2">
              <Button type="button" onClick={handleImportParse}>
                นำเข้าข้อมูล
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImportModal(false)}
              >
                ยกเลิก
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
