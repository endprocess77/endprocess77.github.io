import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/FeCric',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
