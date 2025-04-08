import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

import { addressValidator } from "./geocoding";

export const storeValidator = z.object({
  name: z.string(),
  address: addressValidator,
  logo: z.any().optional().nullable(),
});

export const socialMediaLinkValidator = z.object({
  name: z.string().min(2),
  url: z.string().url(),
});

export const brandingValidator = z.object({
  businessName: z.string().min(2),
  businessLogo: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" })
    .or(z.literal("")),
});

export const brandingSettingsValidator = brandingValidator
  .extend({
    image: z.any().optional().nullable(),
  })
  .omit({ businessLogo: true });

export const shippingSettingsValidator = z.object({
  address: addressValidator,
  hasFreeShipping: z.boolean(),
  minFreeShipping: z.coerce.number().nonnegative().optional(),
  hasPickup: z.boolean(),

  hasFlatRate: z.boolean(),
  flatRateAmount: z.coerce.number().nonnegative().optional(),
  showFullAddress: z.boolean(),
  pickupInstructions: z.string().optional(),
});

export type BrandingFormData = z.infer<typeof brandingSettingsValidator>;
export type ShippingFormData = z.infer<typeof shippingSettingsValidator>;
