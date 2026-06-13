import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "optimistic-mallard-238.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
