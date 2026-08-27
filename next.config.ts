import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Корень показывает START на русском (ТЗ §4.1), URL остаётся `/`.
  // Это rewrite, а не редирект: §3.1 запрещает автоматические редиректы.
  async rewrites() {
    return [{ source: '/', destination: '/ru' }];
  },
};

export default nextConfig;
