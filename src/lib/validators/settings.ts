import { z } from "zod";

import { HeroType } from "@prisma/client";

export const homepageSettingsValidator = z.object({
  heroType: z.nativeEnum(HeroType),
  heroImages: z.array(z.string()),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroButtonText: z.string().optional(),
  heroButtonLink: z.string().optional(),
  tempImages: z.array(z.any()),

  callToActionTitle: z.string().optional(),
  callToActionSubtitle: z.string().optional(),
  callToActionButtonText: z.string().optional(),
  callToActionButtonLink: z.string().optional(),
  callToActionImage: z.string().optional(),
  tempCallToActionImage: z.any().optional(),

  enableCallToAction: z.boolean().optional(),
  enableCollectionsSection: z.boolean().optional(),
  enableBlogSection: z.boolean().optional(),
});

export type HomepageSettingsFormData = z.infer<
  typeof homepageSettingsValidator
>;
