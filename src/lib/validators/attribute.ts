import { z } from "zod";

export const attributeValidator = z.object({
  name: z.string().min(2),
  values: z.array(z.object({ content: z.string() })).refine(
    (input) => {
      return !!(input.flatMap((val) => val.content).join("").length > 0);
    },
    {
      message: "You need at least one value for your attribute.",
      path: ["0.content"],
    },
  ),
});

export const productAttributeValidator = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.string()),
});

export type AttributeFormData = z.infer<typeof attributeValidator>;
