import { z } from "zod";
import { addressValidator } from "./geocoding";

export const storeValidator = z.object({
  name: z.string(),
  address: addressValidator,
  logo: z.any().optional().nullable(),
});
