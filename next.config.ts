import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'out', // 出力ディレクトリ
  images: {
    unoptimized: true, // Electronでは画像最適化を無効化
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
