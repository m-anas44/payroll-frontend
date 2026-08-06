import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Layers,
  Coins,
  ClipboardList,
  Calculator,
  FileSpreadsheet,
  UserCog,
  Settings,
  LucideIcon,
  PlusCircle,
  History,
  FileText,
  User,
} from "lucide-react";
import { UserRole } from "@/types/user";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

export const WORKER_NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/worker",
    icon: LayoutDashboard,
    roles: ["Worker"],
  },
  {
    title: "Daily Production",
    href: "/worker/production",
    icon: PlusCircle,
    roles: ["Worker"],
  },
  {
    title: "My Production History",
    href: "/worker/history",
    icon: History,
    roles: ["Worker"],
  },
  {
    title: "Salary Statements",
    href: "/worker/statements",
    icon: FileText,
    roles: ["Worker"],
  },
  {
    title: "Profile",
    href: "/worker/profile",
    icon: User,
    roles: ["Worker"],
  },
];

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Workers",
    href: "/admin/workers",
    icon: Users,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Departments",
    href: "/admin/departments",
    icon: Building2,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Articles",
    href: "/admin/articles",
    icon: Package,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Operations",
    href: "/admin/operations",
    icon: Layers,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Piece Rates",
    href: "/admin/rates",
    icon: Coins,
    roles: ["Admin"],
  },
  {
    title: "Production",
    href: "/admin/production",
    icon: ClipboardList,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Payroll",
    href: "/admin/payroll",
    icon: Calculator,
    roles: ["Admin"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileSpreadsheet,
    roles: ["Admin", "Worker"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UserCog,
    roles: ["Admin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["Admin"],
  },
];
