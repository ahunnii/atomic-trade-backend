import type { LucideIcon } from "lucide-react";
import { BellRing, LayoutGrid, Settings, ShirtIcon, Users } from "lucide-react";

import type { Role } from "@prisma/client";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  restrictedAccess: Role[];
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  restrictedAccess: Role[];
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/admin/dashboard",
          label: "Dashboard",
          active: pathname.includes("/admin/dashboard"),
          icon: LayoutGrid,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Inventory",
      menus: [
        {
          href: "/admin/products",
          label: "Products",
          active: pathname.includes("/admin/products"),
          icon: ShirtIcon,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },
    {
      groupLabel: "Guides",
      menus: [
        {
          href: "/admin/guides/project-management",
          label: "Project Management",
          active: pathname.includes("/admin/guides/project-management"),
          restrictedAccess: [],

          icon: Users,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/admin/users",
          label: "Users",
          active: pathname.includes("/admin/users"),
          restrictedAccess: [],
          icon: Users,
          submenus: [],
        },
        {
          href: "/admin/broadcast",
          label: "Broadcast Messages",
          active: pathname.includes("/admin/broadcast"),
          restrictedAccess: [],
          icon: BellRing,
          submenus: [],
        },
        {
          href: "/profile",
          label: "Account",
          active: pathname.includes("/admin/account"),
          restrictedAccess: [],
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}
