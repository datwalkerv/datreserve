/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@datreserve/shared-types'],
};

export default nextConfig;
