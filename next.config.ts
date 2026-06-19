import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/webhooks/stripe",
        destination: "/api/stripe/webhook",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/downloads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
