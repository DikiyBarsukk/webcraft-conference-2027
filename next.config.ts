import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: process.env.GITHUB_ACTIONS ? "/webcraft-conference-2027/" : undefined,
};

export default nextConfig;
