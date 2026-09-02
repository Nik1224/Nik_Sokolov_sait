/** robots.txt (ТЗ §12). Studio и предпросмотр черновиков закрыты от роботов (§8.1). */

import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/**
 * Краулеры ассистентов перечислены отдельно, хотя `User-agent: *` их и так
 * допускает.
 *
 * Причина не в формальностях: хостинги и CDN всё чаще режут эти агенты по
 * умолчанию, и явное правило переживает переезд. Заодно оно документирует
 * решение — сайт хочет попадать в ответы ассистентов, а не прятаться от них.
 *
 * Список делится надвое. Одни ходят за обучающими данными, другие открывают
 * страницу в момент вопроса; закрыть вторых значит выпасть из ответов
 * целиком, поэтому пускаем всех.
 */
const ASSISTANTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'Bingbot',
  'YandexBot',
];

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  const disallow = ['/studio', '/api/'];

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: ASSISTANTS, allow: '/', disallow },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
