import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },

  /**
   * Карты кода для сборки не создаются.
   *
   * Turbopack писал их и для серверной части, где они бесполезны: в браузер
   * такие карты не уходят, в бандлы функций не попадают (проверено по
   * `*.nft.json` — ни одной ссылки), и остаются просто весом в выдаче.
   *
   * Замерено на этой сборке: 388 файлов, 57 МБ. Выдача сборки 112 → 54 МБ,
   * кэш сборки 251 → 184 МБ.
   *
   * Цена отказа: если прод-сборка упадёт, стек покажет строки собранного
   * файла, а не исходника. Тогда флаг снимается на одну сборку.
   *
   * Соседний `enablePrerenderSourceMaps` пробовался и убран: на вес выдачи он
   * не повлиял ни на байт, а флаг без замеренного эффекта только путает.
   */
  experimental: { turbopackSourceMaps: false },

  // Корень показывает START на русском (ТЗ §4.1), URL остаётся `/`.
  // Это rewrite, а не редирект: §3.1 запрещает автоматические редиректы.
  async rewrites() {
    return [{ source: '/', destination: '/ru' }];
  },
};

export default nextConfig;
