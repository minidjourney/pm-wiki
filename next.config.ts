/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm8-server.taile0eb21.ts.net', // pm-wiki DB·사진 창구(K12 M8, 2026-10-29 옮김)
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
export default nextConfig;