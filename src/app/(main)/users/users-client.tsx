"use client";

import { useState } from "react";
import { User } from "@/types/api";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  ShieldAlert,
  UserCheck,
  Film,
  Search,
  X,
  Edit3,
  Power,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface UsersClientProps {
  initialUsers: User[];
  currentUserId?: string;
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const { update: updateSession } = useSession();
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "USER" | "REVIEWER" | "ADMIN"
  >("USER");
  const [selectedIsActive, setSelectedIsActive] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper to format date
  const formatLastActive = (dateStr?: string | null) => {
    if (!dateStr) return "ยังไม่มีข้อมูล";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "ยังไม่มีข้อมูล";
      return format(d, "dd/MM/yyyy HH:mm น.");
    } catch (e) {
      return "ยังไม่มีข้อมูล";
    }
  };

  // Filter users
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch = user.displayName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Metrics
  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === "ADMIN").length;
  const reviewerCount = usersList.filter((u) => u.role === "REVIEWER").length;
  const userCount = usersList.filter((u) => u.role === "USER").length;

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedIsActive(user.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const isSelf = !!(
      currentUserId &&
      (selectedUser.id === currentUserId ||
        selectedUser.lineUserId === currentUserId)
    );

    // Prevent disabling oneself
    if (isSelf && !selectedIsActive) {
      alert("คุณไม่สามารถระงับการใช้งานบัญชีของคุณเองได้");
      return;
    }

    setIsUpdating(true);
    try {
      // Update Role
      let roleRes: any = { status: "success" };
      if (selectedRole !== selectedUser.role) {
        roleRes = await apiClient.patch<User>(
          `/users/${selectedUser.id}/role`,
          {
            role: selectedRole,
          },
        );
      }

      // Update Status
      let statusRes: any = { status: "success" };
      if (selectedIsActive !== (selectedUser.isActive !== false)) {
        statusRes = await apiClient.patch<User>(
          `/users/${selectedUser.id}/status`,
          {
            isActive: selectedIsActive,
          },
        );
      }

      if (roleRes.status === "success" && statusRes.status === "success") {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, role: selectedRole, isActive: selectedIsActive }
              : u,
          ),
        );
        setIsModalOpen(false);

        if (isSelf) {
          await updateSession();
          window.location.reload();
        }
      } else {
        alert(
          roleRes.message ||
            statusRes.message ||
            "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้",
        );
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatusQuick = async (user: User) => {
    const isSelf = !!(
      currentUserId &&
      (user.id === currentUserId || user.lineUserId === currentUserId)
    );

    if (isSelf) {
      alert("คุณไม่สามารถระงับการใช้งานบัญชีของคุณเองได้");
      return;
    }

    const newStatus = !user.isActive;
    try {
      const res = await apiClient.patch<User>(`/users/${user.id}/status`, {
        isActive: newStatus,
      });

      if (res.status === "success") {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: newStatus } : u,
          ),
        );
      } else {
        alert(res.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 lg:pb-8 max-w-full mx-auto">
      {/* Top Banner */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 bg-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1">
                จัดการผู้ใช้งานและกำหนดสิทธิ์
              </h1>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 truncate">
                กำหนดบทบาทหน้าที่และจัดการสถานะบัญชีในระบบ
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              สมาชิกทั้งหมด {totalUsers} คน
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Total Users
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {totalUsers}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                Admin
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {adminCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                Reviewer
              </div>
              <div className="text-2xl font-black text-purple-700 mt-1">
                {reviewerCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wide">
                Editor
              </div>
              <div className="text-2xl font-black text-sky-700 mt-1">
                {userCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Film size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Table Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search & Filters */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-slate-900">
              รายชื่อผู้ใช้งานในระบบ
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredUsers.length} รายการ
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Role Filter Select */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">บทบาททั้งหมด</option>
              <option value="ADMIN">👑 Admin</option>
              <option value="REVIEWER">🔍 Reviewer</option>
              <option value="USER">🎬 Editor</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ใช้งาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 💻 Desktop Table View (hidden on small screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-5 py-3.5">ผู้ใช้งาน</th>
                <th className="px-5 py-3.5 text-center">บทบาท</th>
                <th className="px-5 py-3.5 text-center">สถานะบัญชี</th>
                <th className="px-5 py-3.5 text-center">เข้าใช้งานล่าสุด</th>
                <th className="px-5 py-3.5 text-right pr-6">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    ไม่พบรายชื่อผู้ใช้งานที่ตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = !!(
                    currentUserId &&
                    (user.id === currentUserId ||
                      user.lineUserId === currentUserId)
                  );

                  return (
                    <tr
                      key={user.id}
                      className={
                        isSelf
                          ? "bg-emerald-50/40 border-l-4 border-l-emerald-500 hover:bg-emerald-50/60 transition-colors"
                          : "hover:bg-slate-50/80 transition-colors"
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {user.pictureUrl ? (
                            <img
                              src={user.pictureUrl}
                              alt={user.displayName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                              {user.displayName?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.displayName}</span>
                              {isSelf && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                                  (กำลังใช้งานอยู่)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {user.role === "ADMIN" && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                            👑 Admin
                          </span>
                        )}
                        {user.role === "REVIEWER" && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                            🔍 Reviewer
                          </span>
                        )}
                        {user.role === "USER" && (
                          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
                            🎬 Editor
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {user.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ใช้งานปกติ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            ระงับการใช้งาน
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center text-xs text-slate-600 font-medium">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-md text-slate-600 text-xs font-medium">
                          <Clock
                            size={12}
                            className="text-slate-400 shrink-0"
                          />
                          <span>
                            {formatLastActive(
                              user.lastActiveAt ||
                                user.updatedAt ||
                                user.createdAt,
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 size={13} /> แก้ไขสิทธิ์
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 Mobile Card List View (visible only on small screens) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium">
              ไม่พบรายชื่อผู้ใช้งานที่ตรงตามเงื่อนไข
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelf = !!(
                currentUserId &&
                (user.id === currentUserId || user.lineUserId === currentUserId)
              );

              return (
                <div
                  key={user.id}
                  className={
                    isSelf
                      ? "p-3.5 space-y-2.5 bg-emerald-50/30 border-2 border-emerald-500/80 rounded-2xl shadow-2xs"
                      : "p-3.5 space-y-2.5 hover:bg-slate-50/80 transition-colors"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.pictureUrl ? (
                        <img
                          src={user.pictureUrl}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 shadow-2xs">
                          {user.displayName?.[0] || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                          <span className="truncate">{user.displayName}</span>
                          {isSelf && (
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                              (กำลังใช้งานอยู่)
                            </span>
                          )}
                        </div>

                        {/* Last Active Timestamp on Mobile */}
                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Clock
                            size={11}
                            className="text-slate-400 shrink-0"
                          />
                          <span>
                            เข้าใช้งานล่าสุด:{" "}
                            {formatLastActive(
                              user.lastActiveAt ||
                                user.updatedAt ||
                                user.createdAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="shrink-0">
                      {user.role === "ADMIN" && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          👑 Admin
                        </span>
                      )}
                      {user.role === "REVIEWER" && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                          🔍 Reviewer
                        </span>
                      )}
                      {user.role === "USER" && (
                        <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                          🎬 Editor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Status & Quick Edit Buttons */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <div>
                      {user.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ใช้งานปกติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          ระงับการใช้งาน
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} /> แก้ไขสิทธิ์
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Edit User Modal with Role AND Active/Disabled Status Toggle */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" />
                แก้ไขสิทธิ์และสถานะผู้ใช้งาน
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {selectedUser.pictureUrl ? (
                <img
                  src={selectedUser.pictureUrl}
                  alt={selectedUser.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                  {selectedUser.displayName?.[0] || "?"}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="truncate">{selectedUser.displayName}</span>
                  {!!(
                    currentUserId &&
                    (selectedUser.id === currentUserId ||
                      selectedUser.lineUserId === currentUserId)
                  ) && (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      (กำลังใช้งานอยู่)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  บทบาทปัจจุบัน:{" "}
                  <span className="font-bold text-slate-800">
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Select Role */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                1. เลือกบทบาทสิทธิ์ใช้งาน (Role)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ADMIN", label: "👑 Admin" },
                  { id: "REVIEWER", label: "🔍 Reviewer" },
                  { id: "USER", label: "🎬 Editor" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedRole === r.id
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Active Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                2. สถานะการเข้าใช้งานระบบ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIsActive(true)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedIsActive
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  เปิดใช้งาน
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIsActive(false)}
                  disabled={
                    !!(
                      currentUserId &&
                      (selectedUser.id === currentUserId ||
                        selectedUser.lineUserId === currentUserId)
                    )
                  }
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !selectedIsActive
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  } ${
                    currentUserId &&
                    (selectedUser.id === currentUserId ||
                      selectedUser.lineUserId === currentUserId)
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  ปิดใช้งาน
                </button>
              </div>

              {!!(
                currentUserId &&
                (selectedUser.id === currentUserId ||
                  selectedUser.lineUserId === currentUserId)
              ) && (
                <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1">
                  <AlertCircle size={13} className="shrink-0" />
                  บัญชีนี้คือบัญชีที่คุณกำลังล็อกอินอยู่ ไม่สามารถระงับตัวเองได้
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={isUpdating}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUpdating ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
