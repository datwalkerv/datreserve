/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@datreserve/shared-types'],
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
