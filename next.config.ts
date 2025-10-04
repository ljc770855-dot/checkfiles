import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages 部署配置
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // 图片优化配置
  images: {
    unoptimized: true, // Cloudflare Pages 需要禁用图片优化
  },
};

export default nextConfig;
