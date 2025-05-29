import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BoxesIcon,
  BrushIcon,
  CreditCard,
  Files,
  FileText,
  LayoutGrid,
  Percent,
  ShirtIcon,
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
  badge?: number;
  icon: LucideIcon;
  restrictedAccess: Role[];
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(
  pathname: string,
  slug: string,
  pendingOrders: number,
): Group[] {
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
          badge: pendingOrders ?? 0,
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
          href: `/${slug}/pages`,
          label: "Pages",
          active: pathname.includes(`/${slug}/pages`),
          icon: FileText,
          submenus: [
            {
              href: `/${slug}/pages/site`,
              label: "Site Pages",
              active: pathname.includes(`/${slug}/pages/site`),
              restrictedAccess: [],
            },
            {
              href: `/${slug}/pages/reserved`,
              label: "Reserved Pages",
              active: pathname.includes(`/${slug}/pages/reserved`),
              restrictedAccess: [],
            },
          ],
          restrictedAccess: [],
        },
      ],
    },

    {
      groupLabel: "Settings",
      menus: [
        {
          href: ``,
          label: "Customization",
          active: pathname.includes(`/${slug}/settings/store/customization`),
          restrictedAccess: [],
          icon: BrushIcon,
          submenus: [
            {
              href: `/${slug}/settings/customization/homepage`,
              label: "Homepage",
              active: pathname.includes(
                `/${slug}/settings/customization/homepage`,
              ),
              restrictedAccess: [],
            },
            {
              href: `/${slug}/settings/customization/branding`,
              label: "Site Branding",
              active: pathname.includes(
                `/${slug}/settings/customization/branding`,
              ),
              restrictedAccess: [],
            },
          ],
        },
        {
          href: `/${slug}/settings/policies`,
          label: "Policies",
          active: pathname.includes(`/${slug}/settings/policies`),
          restrictedAccess: [],
          icon: StarsIcon,
          submenus: [],
        },

        {
          href: `/${slug}/settings/shipping`,
          label: "Shipping",
          active: pathname.includes(`/${slug}/settings/shipping`),
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
