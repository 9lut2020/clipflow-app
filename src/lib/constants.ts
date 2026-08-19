import { 
  LucideIcon, 
  LayoutDashboard, 
  FileVideo, 
  Users, 
  Settings,
  ClipboardList,
  BarChart3,
  Bell
} from 'lucide-react';

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

export function getSidebarMenu(role: string): { section: string; items: SidebarMenuItem[] }[] {
  const isUser = role === "USER";
  const isReviewer = role === "REVIEWER";
  const isAdmin = role === "ADMIN";

  const menus: { section: string; items: SidebarMenuItem[] }[] = [];

  if (isUser) {
    menus.push({
      section: "Main",
      items: [
        { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
        { title: "งานของฉัน", href: "/tasks", icon: ClipboardList },
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
          { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
        ],
      },
      {
        section: "System",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
        ],
      }
    );
  }

  if (isAdmin) {
    menus.push(
      {
        section: "Main",
        items: [
          { title: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
          { title: "ภาพรวมระบบ", href: "/tasks", icon: ClipboardList },
          { title: "รายงานวิเคราะห์", href: "/analytics", icon: BarChart3 },
          { title: "โปรเจกต์ทั้งหมด", href: "/projects", icon: FileVideo },
        ],
      },
      {
        section: "System",
        items: [
          { title: "ศูนย์แจ้งเตือน", href: "/notifications", icon: Bell },
          { title: "จัดการผู้ใช้งาน", href: "/users", icon: Users },
          { title: "ตั้งค่าระบบ", href: "/settings", icon: Settings },
        ],
      }
    );
  }

  return menus;
}
