import * as Minio from "minio";

import { env } from "~/env";

const endPoint = env.NEXT_PUBLIC_STORAGE_URL.replace(/^https?:\/\//, "");

const minioClient = new Minio.Client({
  endPoint,
  port: undefined, // Default MinIO port
  useSSL: true, // Set to true if you're using HTTPS
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export default minioClient;
