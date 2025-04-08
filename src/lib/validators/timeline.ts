import { z } from "zod";

export const timelineEntryValidator = z.object({
  orderId: z.string(),
  title: z.string(),
  description: z.string(),
});
