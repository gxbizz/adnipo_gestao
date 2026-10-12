process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
