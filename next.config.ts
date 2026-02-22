/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bjkiwfktgvhjrtfuyhev.supabase.co', // 👈 본인의 Supabase 주소 (https:// 빼고!)
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
export default nextConfig;