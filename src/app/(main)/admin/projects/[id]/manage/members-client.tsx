"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/api";
import { toast } from "sonner";
import { Trash2, UserPlus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MembersClient({
  projectId,
  allUsers,
}: {
  projectId: string;
  allUsers: User[];
}) {
  const { data: membersResponse, mutate } = useSWR<{
    status: string;
    data: User[];
  }>(`/projects/${projectId}/members`, async (url: string) => {
    const res = await apiClient.get<User[]>(url);
    return { status: res.status, data: res.data || [] };
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [membersToDelete, setMembersToDelete] = useState<{
    id: string;
    name: string;
  }[] | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const members = membersResponse?.data || [];
  const memberIds = new Set(members.map((m) => m.id));

  // Filter users that are NOT yet members AND hide global ADMINs
  const availableUsers = allUsers.filter(
    (u) => !memberIds.has(u.id) && u.role !== "ADMIN",
  );

  const userOptions = availableUsers.map((u) => ({
    value: u.id,
    label: `${u.displayName} (${u.role})`,
  }));

  const handleAddMember = async () => {
    if (selectedUsers.length === 0) return;
    setIsAdding(true);
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          apiClient.post(`/projects/${projectId}/members`, { userId }),
        ),
      );
      toast.success("เพิ่มสมาชิกสำเร็จ");
      setSelectedUsers([]);
      mutate();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสมาชิก");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmRemoveMember = async () => {
    if (!membersToDelete || membersToDelete.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        membersToDelete.map((member) =>
          apiClient.delete(`/projects/${projectId}/members/${member.id}`)
        )
      );
      toast.success("ลบสมาชิกสำเร็จ");
      mutate();
      setMembersToDelete(null);
      setSelectedForDelete([]);
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบสมาชิก");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!membersResponse) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-8 pb-8 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          เพิ่มสมาชิกเข้าโปรเจกต์
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1 max-w-md">
            <MultiSelectCombobox
              options={userOptions}
              value={selectedUsers}
              onChange={setSelectedUsers}
              placeholder="-- ค้นหาและเลือกผู้ใช้ (สามารถเลือกได้หลายคน) --"
              searchPlaceholder="ค้นหาชื่อผู้ใช้งาน..."
              emptyText="ไม่พบผู้ใช้งาน"
            />
          </div>
          <Button
            onClick={handleAddMember}
            disabled={selectedUsers.length === 0 || isAdding}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            เพิ่มลงโปรเจกต์{" "}
            {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            รายชื่อสมาชิกปัจจุบัน{" "}
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">
              {members.length}
            </span>
          </h2>
          {selectedForDelete.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setMembersToDelete(
                  members
                    .filter((m) => selectedForDelete.includes(m.id))
                    .map((m) => ({ id: m.id, name: m.displayName }))
                )
              }
              className="bg-rose-100 hover:bg-rose-200 text-rose-700 shadow-none border-none h-8 px-3"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              ลบที่เลือก ({selectedForDelete.length})
            </Button>
          )}
        </div>
        {members.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <UserPlus className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium">ยังไม่มีสมาชิกในโปรเจกต์นี้</p>
            <p className="text-xs text-slate-400 mt-1">
              คุณสามารถเพิ่มทีมงานของคุณได้จากกล่องด้านบน
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="group flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <input
                    type="checkbox"
                    checked={selectedForDelete.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForDelete([...selectedForDelete, member.id]);
                      } else {
                        setSelectedForDelete(selectedForDelete.filter((id) => id !== member.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 flex-shrink-0"
                  />
                  {member.pictureUrl ? (
                    <img
                      src={member.pictureUrl}
                      alt={member.displayName}
                      className="w-10 h-10 rounded-full border border-slate-100 shadow-sm object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm shadow-sm shrink-0">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">
                      {member.displayName}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setMembersToDelete([
                      {
                        id: member.id,
                        name: member.displayName,
                      },
                    ])
                  }
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 shrink-0"
                  title="ลบออกจากโปรเจกต์"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!membersToDelete}
        onOpenChange={(open) => !open && !isDeleting && setMembersToDelete(null)}
      >
        <DialogContent className="max-w-[400px] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบสมาชิก</DialogTitle>
            <DialogDescription>
              คุณต้องการลบสมาชิกจำนวน <strong>{membersToDelete?.length}</strong> คน
              ออกจากโปรเจกต์ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              {membersToDelete?.length === 1 && (
                <div className="mt-2 text-slate-600 font-medium">
                  ชื่อ: {membersToDelete[0].name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setMembersToDelete(null)}
              disabled={isDeleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveMember}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              ลบสมาชิก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
