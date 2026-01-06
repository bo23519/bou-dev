/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'original-meerkat-298.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
