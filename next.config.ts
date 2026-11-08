import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

if (!process.env.BACKEND_URL) {
  throw new Error("BACKEND_URL is required. Copy .env.example to .env.");
}

const backendUrl = process.env.BACKEND_URL.replace(/\/+$/, "");
const backend = new URL(backendUrl);

const nextConfig: NextConfig = {
  // Next's gzip buffers the proxied AI stream, so text would arrive all at once.
  // Vercel compresses pages at its edge, so nothing is lost there.
  compress: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60],
    // Includes phone-card widths the defaults skip (272px at 2x would get 640w).
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 160, 256],
    remotePatterns: [
      {
        protocol: backend.protocol === "https:" ? "https" : "http",
        hostname: backend.hostname,
      },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/backend/:path*",
        headers: [
          { key: "Cache-Control", value: "no-transform" },
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/backend/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
