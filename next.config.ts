import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://cdn.hackclub.com/**')],
  },
};

export default nextConfig;
