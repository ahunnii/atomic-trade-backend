import { z } from "zod";

export const shippingLabelValidator = z.object({
  rateId: z.string(),
  shipDate: z.date(),
  shipmentId: z.string().optional(),
  cost: z.string(),
  carrier: z.string(),
  timeEstimate: z.string(),
  expireAt: z.date().optional(),
  orderId: z.string(),
  labelSize: z.string().optional(),
  items: z.array(z.object({ id: z.string() })),
});

export const addressValidator = z.object({
  name: z.string().min(2),
  street: z.string().min(1, "Street is required"),
  additional: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip is required"),
  country: z.string().min(1, "Country is required"),
});

export const packageValidator = z.object({
  package_length: z.coerce.number().min(1),
  package_width: z.coerce.number().min(1),
  package_height: z.coerce.number().min(1),
  package_weight_lbs: z.coerce.number(),
  package_weight_oz: z.coerce.number(),
  distance_unit: z.enum(["in", "cm"]).optional(),
  mass_unit: z.enum(["lb", "kg"]).optional(),
});
