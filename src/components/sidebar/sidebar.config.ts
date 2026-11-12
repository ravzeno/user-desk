import {
  Activity,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserListScope } from "@/lib/api/type/user";

export interface MenuSubItem {
  label: string;
  to: string;
  scope: UserListScope;
}

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  to: string;
  children?: MenuSubItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: "ผู้ใช้",
    icon: Users,
    to: "/users",
    children: [
      { label: "ลูกค้า", to: "/users?scope=customer", scope: "customer" },
      {
        label: "Backoffice",
        to: "/users?scope=backoffice",
        scope: "backoffice",
      },
    ],
  },
  { label: "กลุ่ม", icon: ShieldCheck, to: "/groups" },
  { label: "ประวัติการเปลี่ยนแปลง", icon: Activity, to: "/audit-logs" },
];
