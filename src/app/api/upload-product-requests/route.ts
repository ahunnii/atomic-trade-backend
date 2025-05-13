import { createUploadRouteHandler, route } from "better-upload/server";

import { s3MinioClient } from "~/lib/file-upload/clients/s3";

export const { POST } = createUploadRouteHandler({
  client: s3MinioClient,
  bucketName: "product-requests",
  routes: {
    images: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 3,
    }),
  },
});
