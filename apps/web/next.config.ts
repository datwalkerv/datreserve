import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@datreserve/shared-types'],
};

export default nextConfig;
