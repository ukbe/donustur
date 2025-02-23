import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aws-amplify/ui-react",
    "@aws-amplify/ui-react-core",
    "@aws-amplify/ui",
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
