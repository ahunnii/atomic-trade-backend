import type { SocialMediaType } from "@prisma/client";

export type Store = {
  id: string;
  name: string;
  slug?: string | null;
  ownerId: string;
  logo?: string | null;

  addressId?: string | null;
  address?: Address | null;

  //   products?: Product[];
  //   orders?: Order[];

  //   sales?: Sale[];
  //   coupons?: Coupon[];
  //   invoices?: Invoice[];
  //   cart?: Cart[];
  //   collections?: Collection[];
  //   requests?: Request[];

  hasFreeShipping: boolean;
  minFreeShipping?: number | null;

  hasPickup: boolean;
  pickupInstructions?: string | null;

  hasFlatRate: boolean;
  flatRateAmount?: number | null;

  createdAt: Date;
  updatedAt: Date;

  socialMedia?: SocialMediaLink[];

  contactEmail?: string | null;
  contactPhone?: string | null;
  showFullAddress: boolean;

  customProductTypes: string[];
};

export type SocialMediaLink = {
  id: string;
  storeId: string;
  store?: Store;
  url: string;
  platform: SocialMediaType;
};

export type Address = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  formatted: string;
  street: string;
  additional?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean | null;
};
