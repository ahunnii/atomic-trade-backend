import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BoxesIcon,
  FileJson,
  Files,
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
          href: `/${slug}/dashboard`,
          label: "Dashboard",
          active: pathname.includes(`/${slug}/dashboard`),
          icon: LayoutGrid,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Management",
      menus: [
        {
          href: ``,
          label: "Orders",
          active:
            pathname.includes(`/${slug}/orders`) ||
            pathname.includes(`/${slug}/draft-orders`),
          icon: Files,
          submenus: [
            {
              href: `/${slug}/orders`,
              label: "Store Orders",
              active: pathname.includes(`/${slug}/orders`),
              restrictedAccess: [],
            },
            {
              href: `/${slug}/draft-orders`,
              label: "Draft Orders",
              active: pathname.includes(`/${slug}/draft-orders`),
              restrictedAccess: [],
            },
          ],
          restrictedAccess: [],
        },

        {
          href: `/${slug}/customers`,
          label: "Customers",
          active: pathname.includes(`/${slug}/customers`),
          icon: Users,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Inventory",
      menus: [
        {
          href: `/${slug}/products`,
          label: "Products",
          active: pathname.includes(`/${slug}/products`),
          icon: ShirtIcon,
          submenus: [],
          restrictedAccess: [],
        },
        {
          href: `/${slug}/collections`,
          label: "Collections",
          active: pathname.includes(`/${slug}/collections`),
          icon: BoxesIcon,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Settings",
      menus: [
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
      ],
    },
  ];
}
