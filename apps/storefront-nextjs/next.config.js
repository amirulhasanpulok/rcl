/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_API_GATEWAY_URL:
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://api.rclplanet.com',
  },

  // Disable for now (enable later when routes are typed)
  // experimental: {
  //   typedRoutes: true,
  // },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.example.com',
      },
    ],
  },
};

module.exports = nextConfig;

