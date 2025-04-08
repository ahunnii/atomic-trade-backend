import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  LayoutGrid,
  Settings,
  ShirtIcon,
  StarsIcon,
  TruckIcon,
  Users,
} from "lucide-react";

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

export function getMenuList(pathname: string, slug: string): Group[] {
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
          href: `/${slug}/settings/store/branding`,
          label: "Branding",
          active: pathname.includes(`/${slug}/settings/store/branding`),
          restrictedAccess: [],
          icon: StarsIcon,
          submenus: [],
        },
        {
          href: `/${slug}/settings/store/shipping`,
          label: "Shipping",
          active: pathname.includes(`/${slug}/settings/store/shipping`),
          restrictedAccess: [],
          icon: TruckIcon,
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
