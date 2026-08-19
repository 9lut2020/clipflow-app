import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ["*.trycloudflare.com", "par-did-permitted-converter.trycloudflare.com"],
};

export default nextConfig;
