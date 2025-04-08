/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["minio-cwkws8w0k4ggkkkggo0o8cok.dreamwalkerstudios.co"],
  },
};

export default config;
