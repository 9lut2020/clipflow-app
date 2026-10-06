import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old duplicate routes, kept working for bookmarks.
  async redirects() {
    return [
      { source: "/admin/user", destination: "/users", permanent: true },
      { source: "/admin/users", destination: "/users", permanent: true },
      { source: "/audit-logs", destination: "/admin/audit-logs", permanent: true },
    ];
  },
  allowedDevOrigins: ["*.trycloudflare.com", "par-did-permitted-converter.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
