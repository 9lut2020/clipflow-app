"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/api";
import { toast } from "sonner";
import { Trash2, UserPlus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const members = membersResponse?.data || [];
  const memberIds = new Set(members.map((m) => m.id));

  // Filter users that are NOT yet members and match search
  const availableUsers = allUsers.filter(
    (u) =>
      !memberIds.has(u.id) &&
      u.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setIsAdding(true);
    try {
      await apiClient.post(`/projects/${projectId}/members`, {
        userId: selectedUser,
      });
      toast.success("เพิ่มสมาชิกสำเร็จ");
      setSelectedUser("");
      mutate();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสมาชิก");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("คุณต้องการลบสมาชิกคนนี้ออกจากโปรเจกต์ใช่หรือไม่?")) return;
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      toast.success("ลบสมาชิกสำเร็จ");
      mutate();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบสมาชิก");
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
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          เพิ่มสมาชิกเข้าโปรเจกต์
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้งาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full sm:w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกผู้ใช้ที่ต้องการเพิ่ม --</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName} ({u.role})
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUser || isAdding}
            className="shrink-0 bg-blue-600 hover:bg-blue-700"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            เพิ่มลงโปรเจกต์
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          รายชื่อสมาชิกปัจจุบัน ({members.length})
        </h2>
        {members.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            ยังไม่มีสมาชิกในโปรเจกต์นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {member.pictureUrl ? (
                    <img
                      src={member.pictureUrl}
                      alt=""
                      className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {member.displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      {member.displayName}
                    </p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ลบออกจากโปรเจกต์"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
