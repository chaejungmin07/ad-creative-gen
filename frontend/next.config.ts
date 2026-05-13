import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
    ],
  },
  // 다운로드 API는 이미지 fetch + 리사이징으로 시간이 걸림
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
