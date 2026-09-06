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
} from "lucide-react";
import { UserRole } from "@/types/user";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

export const OPERATOR_NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Daily Production",
    href: "/operator",
    icon: PlusCircle,
    roles: ["operator"],
  },
  {
    title: "Production History",
    href: "/operator/history",
    icon: History,
    roles: ["operator"],
  },
];

export const WORKER_NAVIGATION_ITEMS = OPERATOR_NAVIGATION_ITEMS;

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "operator"],
  },
  {
    title: "Workers",
    href: "/admin/workers",
    icon: Users,
    roles: ["admin", "operator"],
  },
  {
    title: "Departments",
    href: "/admin/departments",
    icon: Building2,
    roles: ["admin", "operator"],
  },
  {
    title: "Articles",
    href: "/admin/articles",
    icon: Package,
    roles: ["admin", "operator"],
  },
  {
    title: "Operations",
    href: "/admin/operations",
    icon: Layers,
    roles: ["admin", "operator"],
  },
  {
    title: "Piece Rates",
    href: "/admin/rates",
    icon: Coins,
    roles: ["admin"],
  },
  {
    title: "Production",
    href: "/admin/production",
    icon: ClipboardList,
    roles: ["admin", "operator"],
  },
  {
    title: "Payroll",
    href: "/admin/payroll",
    icon: Calculator,
    roles: ["admin"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileSpreadsheet,
    roles: ["admin", "operator"],
  },
  {
    title: "operators",
    href: "/admin/users",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
];
