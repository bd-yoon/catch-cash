/** @type {import('next').NextConfig} */
const nextConfig = {
  // API 라우트 사용으로 static export 불가 → Vercel 서버리스 모드
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
