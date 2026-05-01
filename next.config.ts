import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.0.141", "192.168.0.157", "192.168.0.160"],
};

export default nextConfig;
