import {
  LucideIcon,
  LayoutDashboard,
  FileVideo,
  Users,
  Settings,
  ClipboardList,
  BarChart3,
  Bell,
  ShieldCheck,
  Plus,
  List,
  CalendarDays,
} from "lucide-react";

export interface SidebarMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: {
    title: string;
    href: string;
    badge?: string;
  }[];
}

export function getSidebarMenu(
  role: string,
): { section: string; items: SidebarMenuItem[] }[] {
  const isUser = role === "USER";
  const isReviewer = role === "REVIEWER";
  const isAdmin = role === "ADMIN";

  const menus: { section: string; items: SidebarMenuItem[] }[] = [];

  if (isUser) {
    menus.push({
      section: "Main",
      items: [
        { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
        { title: "ส่งคลิป", href: "/submit", icon: Plus },
        { title: "งานของฉัน", href: "/tasks", icon: ClipboardList },
        { title: "ปฏิทินเผยแพร่", href: "/calendar", icon: CalendarDays },
        { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
      ],
    });
  }

  if (isReviewer) {
    menus.push(
      {
        section: "Main",
        items: [
          { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
          { title: "งานของฉัน", href: "/tasks", icon: ClipboardList },
          { title: "ปฏิทินเผยแพร่", href: "/calendar", icon: CalendarDays },
          { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
        ],
      },
      {
        section: "System",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
        ],
      },
    );
  }

  if (isAdmin) {
    menus.push(
      {
        section: "Main",
        items: [
          { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
          {
            title: "พื้นที่ทำงาน",
            href: "/tasks",
            icon: ClipboardList,
            children: [
              { title: "ตารางงานทั้งหมด", href: "/tasks" },
              { title: "ปฏิทินเผยแพร่", href: "/calendar" },
              { title: "จัดการการเผยแพร่", href: "/admin/publish" },
              { title: "ส่งคลิปใหม่", href: "/submit" },
              { title: "หน้าเมนู", href: "/menu" },
            ],
          },
          {
            title: "การจัดการโปรเจกต์",
            href: "/projects",
            icon: FileVideo,
            children: [
              { title: "รายการโปรเจกต์ทั้งหมด", href: "/projects" },
              { title: "สร้างโปรเจกต์ใหม่", href: "/admin/projects/create" },
            ],
          },
          { title: "รายงานวิเคราะห์", href: "/analytics", icon: BarChart3 },
        ],
      },
      {
        section: "System",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
          {
            title: "ตั้งค่าและผู้ใช้งาน",
            href: "/settings",
            icon: Settings,
            children: [
              { title: "ตั้งค่าระบบทั่วไป", href: "/settings" },
              { title: "จัดการผู้ใช้งาน", href: "/users" },
              { title: "ประวัติการทำงานระบบ", href: "/admin/audit-logs" },
            ],
          },
        ],
      },
    );
  }

  return menus;
}
