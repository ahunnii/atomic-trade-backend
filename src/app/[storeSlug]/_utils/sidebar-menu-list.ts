import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BoxesIcon,
  BrushIcon,
  CreditCard,
  FileJson,
  Files,
  FileText,
  LayoutGrid,
  Percent,
  Settings,
  ShirtIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
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
        {
          href: `/${slug}/discounts`,
          label: "Discounts",
          active: pathname.includes(`/${slug}/discounts`),
          icon: Percent,
          submenus: [],
          restrictedAccess: [],
        },
        {
          href: `/${slug}/requests`,
          label: "Product Requests",
          active: pathname.includes(`/${slug}/requests`),
          icon: FileText,
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
        {
          href: `/${slug}/carts`,
          label: "Carts",
          active: pathname.includes(`/${slug}/carts`),
          icon: ShoppingCartIcon,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },
    {
      groupLabel: "Content",
      menus: [
        {
          href: `/${slug}/blog`,
          label: "Blog",
          active: pathname.includes(`/${slug}/blog`),
          icon: FileText,
          submenus: [],
          restrictedAccess: [],
        },
        {
          href: `/${slug}/site-pages`,
          label: "Site Pages",
          active: pathname.includes(`/${slug}/site-pages`),
          icon: FileText,
          submenus: [],
          restrictedAccess: [],
        },
        {
          href: `/${slug}/settings/reserved-pages`,
          label: "Reserved Pages",
          active: pathname.includes(`/${slug}/settings/reserved-pages`),
          icon: FileText,
          submenus: [],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Settings",
      menus: [
        {
          href: `/${slug}/settings/policies`,
          label: "Policies",
          active: pathname.includes(`/${slug}/settings/policies`),
          restrictedAccess: [],
          icon: StarsIcon,
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
          href: `/${slug}/settings/store/customization`,
          label: "Customization",
          active: pathname.includes(`/${slug}/settings/store/customization`),
          restrictedAccess: [],
          icon: BrushIcon,
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
          href: `/${slug}/settings/payments`,
          label: "Payments",
          active: pathname.includes(`/${slug}/settings/payments`),
          restrictedAccess: [],
          icon: CreditCard,
          submenus: [
            {
              href: `/${slug}/settings/payments/dashboard`,
              label: "Dashboard",
              active: pathname.includes(`/${slug}/settings/payments/dashboard`),
              restrictedAccess: [],
            },
            {
              href: `/${slug}/settings/payments/checkout`,
              label: "Checkout",
              active: pathname.includes(`/${slug}/settings/payments/checkout`),
              restrictedAccess: [],
            },
          ],
        },
      ],
    },
  ];
}
