import { z } from "zod";

export const policiesValidator = z.object({
  privacyPolicy: z.any(),
  shippingPolicy: z.any(),
  termsOfService: z.any(),
  refundPolicy: z.any(),
});

export type PoliciesFormData = z.infer<typeof policiesValidator>;
