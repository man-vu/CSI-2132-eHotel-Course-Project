import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = "source-map"; // Enables source maps for client-side debugging
    }
    return config;
  }
};

export default nextConfig;
