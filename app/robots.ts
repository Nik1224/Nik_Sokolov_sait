/** robots.txt (ТЗ §12). Studio и предпросмотр черновиков закрыты от роботов (§8.1). */

import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
