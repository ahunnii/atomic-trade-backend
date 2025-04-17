import { createUploadRouteHandler, route } from "better-upload/server";

import { s3MinioClient } from "~/lib/file-upload/clients/s3";

export const { POST } = createUploadRouteHandler({
  client: s3MinioClient,
  bucketName: "misc",
  routes: {
    misc: route({ fileTypes: ["image/*"] }),
    images: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 8,
    }),
  },
});
