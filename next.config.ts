import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "otgcamotncgafefxjahd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    allowedDevOrigins: ["172.20.10.2"],
  },
};

export default nextConfig;
