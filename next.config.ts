import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ["@neondatabase/serverless", "@prisma/adapter-neon"],
  // Allow serving uploaded files with long cache
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
