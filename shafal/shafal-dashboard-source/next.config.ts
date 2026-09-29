import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" and basePath to allow standard npm run start
  images: {
    unoptimized: true
  }
};

export default nextConfig;
