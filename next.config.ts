import type { NextConfig } from "next";
import outputs from './amplify_outputs.json';

const bucket = outputs.storage.buckets.find((bucket) => bucket.name === 'donustur-templates')

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
        hostname: `${bucket!.bucket_name}.s3.${bucket!.aws_region}.amazonaws.com`,
        pathname: '/**',
      }
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
