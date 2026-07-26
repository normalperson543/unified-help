import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://cdn.hackclub.com/**")],
  },
};

export default nextConfig;
