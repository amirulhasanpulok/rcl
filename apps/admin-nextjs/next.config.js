/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_API_GATEWAY_URL:
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://api.rclplanet.com',
  },

//  experimental: {
//    typedRoutes: true,
//  },
};

module.exports = nextConfig;

