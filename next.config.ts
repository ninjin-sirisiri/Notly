import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 静的エクスポート
  distDir: "out", // 出力ディレクトリ
  images: {
    unoptimized: true, // Electronでは画像最適化を無効化
  },
};

export default nextConfig;
