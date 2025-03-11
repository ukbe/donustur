import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aws-amplify/ui-react",
    "@aws-amplify/ui-react-core",
    "@aws-amplify/ui",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'w7.pngwing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.pngwing.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
