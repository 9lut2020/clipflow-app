"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useBatchCreateClips } from "@/hooks/use-api";
import { Save, Plus, Trash2, FileText, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PLATFORM_CONFIG } from "@/components/ui/platform-badge";

interface SpreadsheetManagerProps {
  projectId: string;
  initialClips: any[];
  users: any[];
}

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
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate space below
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

      const handleScroll = () => setOpen(false);
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
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
  users,
}: SpreadsheetManagerProps) {
  const router = useRouter();
  const { batchCreateClips, isSaving } = useBatchCreateClips();
  const [clips, setClips] = useState<any[]>(initialClips);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");

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
    if (filterEpisode !== "ALL" && clip.episodeNo.toString() !== filterEpisode)
      return false;
    if (
      filterAssignee !== "ALL" &&
      (clip.ownerId || "") !==
        (filterAssignee === "UNASSIGNED" ? "" : filterAssignee)
    )
      return false;
    return true;
  });

  // Get unique episodes for the filter dropdown
  const uniqueEpisodes = Array.from(
    new Set(clips.map((c) => c.episodeNo)),
  ).sort((a, b) => a - b);

  const handleAddRow = () => {
    setClips([
      ...clips,
      {
        id: `new-${Date.now()}`,
        episodeNo: clips.length > 0 ? clips[clips.length - 1].episodeNo : 1,
        name: "",
        description: "",
        ownerId: "",
        platform: "TIKTOK",
        status: "DRAFT",
      },
    ]);
  };

  const handleRemoveRow = async (index: number) => {
    const clip = clips[index];
    if (clip.id && !clip.id.toString().startsWith("new-")) {
      if (
        !confirm(
          "คุณแน่ใจหรือไม่ว่าต้องการลบแถวนี้? ระบบจะลบข้อมูลคลิปนี้ทันที (ไม่สามารถกู้คืนได้)",
        )
      ) {
        return;
      }
      try {
        const result = await api.delete(`/clips/${clip.id}`);
        if (result.status !== "success") {
          toast.error(`ลบไม่สำเร็จ: ${result.message || "Unknown error"}`);
          return;
        }
        toast.success("ลบแถวเรียบร้อยแล้ว");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        return;
      }
    }

    const newClips = [...clips];
    newClips.splice(index, 1);
    setClips(newClips);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newClips = [...clips];
    newClips[index][field] =
      field === "episodeNo" ? parseInt(value) || 0 : value;
    setClips(newClips);
  };

  const handleApplyToAllBelow = (index: number, userId: string) => {
    if (!confirm("ยืนยันการเซ็ตคนตัดต่อคนนี้ให้กับคลิปที่อยู่ด้านล่างทั้งหมด?"))
      return;
    const newClips = [...clips];
    const targetUserId = userId;
    for (let i = index; i < newClips.length; i++) {
      newClips[i].ownerId = targetUserId;
    }
    setClips(newClips);
  };

  const handleSave = async () => {
    const invalidRows = clips.filter((c) => !c.name || !c.episodeNo);
    if (invalidRows.length > 0) {
      toast.error("กรุณากรอกชื่อคลิปและ Episode ให้ครบถ้วน");
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

  const handleImportParse = () => {
    if (!importText.trim()) return;

    const lines = importText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const newClips: any[] = [];

    let currentEpisode =
      clips.length > 0 ? clips[clips.length - 1].episodeNo : 1;

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
      <div className="p-2 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-center md:justify-end gap-1 sm:gap-3 hide-scrollbar">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddRow}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-slate-100 text-slate-700 font-bold border-slate-300"
          >
            <Plus size={14} className="mr-1 sm:mr-1.5 shrink-0" />{" "}
            <span className="text-xs sm:text-sm whitespace-nowrap">
              เพิ่มแถว
            </span>
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            size="sm"
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border-indigo-200"
          >
            <FileText size={14} className="mr-1 sm:mr-1.5 shrink-0" />{" "}
            <span className="text-xs sm:text-sm whitespace-nowrap">
              วางข้อความอัตโนมัติ
            </span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-8 px-2 sm:px-4 ml-auto"
          >
            <Save size={14} className="mr-1 sm:mr-1.5 shrink-0" />
            <span className="text-xs sm:text-sm whitespace-nowrap">
              {isSaving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
            </span>
          </Button>
        </div>
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
        <select
          value={filterEpisode}
          onChange={(e) => setFilterEpisode(e.target.value)}
          className="shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">ทุกตอน</option>
          {uniqueEpisodes.map((ep) => (
            <option key={ep} value={ep}>
              EP. {ep}
            </option>
          ))}
        </select>
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
              <th className="px-3 py-2 border-r border-blue-200 font-bold w-[60px] text-center">
                ลำดับ
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold text-left min-w-[200px]">
                ชื่อคลิป
              </th>
              <th className="hidden md:table-cell px-3 py-2 border-r border-blue-200 font-bold text-left min-w-[250px]">
                รายละเอียด
              </th>
              <th className="px-3 py-2 border-r border-blue-200 font-bold w-[60px] sm:w-[80px] text-center">
                EP
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
                  colSpan={6}
                  className="p-8 text-center text-slate-400 bg-white"
                >
                  ยังไม่มีข้อมูลคลิป กดปุ่ม "เพิ่มแถว" เพื่อเริ่มสร้าง
                </td>
              </tr>
            ) : (
              filteredClips.map((clip, filteredIndex) => {
                // Find the actual index in the main 'clips' array to mutate correctly
                const index = clips.findIndex((c) => c.id === clip.id);
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={clip.id || index}
                    className={`${isEven ? "bg-white" : "bg-slate-50"} hover:bg-blue-50/50 transition-colors group focus-within:relative focus-within:z-50 hover:relative hover:z-40`}
                  >
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
                    <td className="border-r border-b border-slate-200 p-0">
                      <input
                        type="number"
                        value={clip.episodeNo || ""}
                        onChange={(e) =>
                          handleChange(index, "episodeNo", e.target.value)
                        }
                        className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all text-center font-bold text-blue-600"
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
                        onChange={(e) => handleChange(index, "platform", e.target.value)}
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
        {/* Extra space at the bottom so the dropdown menu of the last row doesn't get cut off */}
        <div className="h-48"></div>
      </div>

      <div className="p-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>จำนวนทั้งหมด {clips.length} คลิป</span>
        <span className="italic text-slate-400">
          การแก้ไขจะบันทึกเมื่อกดปุ่ม "บันทึกทั้งหมด"
        </span>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  วางข้อความนำเข้าอัตโนมัติ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบจะดึงข้อมูลชื่อคลิปและ Episode จากข้อความโดยอัตโนมัติ
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium leading-relaxed">
                <p className="font-bold mb-1">ตัวอย่างรูปแบบที่รองรับ:</p>
                <p>คลิปไฮไลท์ อีพี 6</p>
                <p>ไฮไลท์อีพี 6 คลิป 1</p>
                <p>"ความขัดแย้ง…เรื่องธรรมดา? "</p>
                <p>🕣เวลา 2.46 - 3.50</p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="วางข้อความที่ Copy มาที่นี่..."
                className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm font-medium text-slate-700"
              />
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <Button
                onClick={() => setShowImportModal(false)}
                variant="ghost"
                className="font-bold text-slate-600 hover:bg-slate-200"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleImportParse}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm px-6"
              >
                นำเข้าข้อมูล
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
