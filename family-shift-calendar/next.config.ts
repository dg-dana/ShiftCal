import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    // Force modern JSX transform for these packages
    'react-big-calendar',
  ],
  compiler: {
    // Use modern JSX transform
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
