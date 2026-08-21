/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // DiceBear avatars used for seeded teammates and guest users.
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

export default nextConfig;
