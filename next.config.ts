import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Ensure we bind to all interfaces
  compress: true,
};

export default nextConfig;
