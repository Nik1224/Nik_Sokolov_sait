/**
 * sitemap.xml (ТЗ §12).
 *
 * В карту попадают только опубликованные страницы. Статья с несколькими
 * направлениями указывается один раз — по каноническому адресу основного
 * направления, иначе дубли конкурировали бы между собой (§6).
 */

import type { MetadataRoute } from 'next';
import {
  getArticles,
  getPricing,
  getProjects,
} from '@/content/queries';
import { absoluteUrl, href, startHref } from '@/lib/routing';
import { DIRECTION_SECTIONS, DIRECTIONS, LOCALES, siteUrl, type Direction, type Section } from '@/lib/site';

function workSection(direction: Direction): Section {
  if (direction === 'business') return 'cases';
  if (direction === 'production') return 'work';
  return 'portfolio';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({ url: absoluteUrl(startHref(locale), origin), priority: 1 });

    for (const direction of DIRECTIONS) {
      entries.push({ url: absoluteUrl(href({ locale, direction }), origin), priority: 0.9 });

      for (const section of DIRECTION_SECTIONS[direction]) {
        entries.push({ url: absoluteUrl(href({ locale, direction, section }), origin), priority: 0.7 });
      }

      const [projects, articles] = await Promise.all([
        getProjects({ direction }),
        getArticles({ direction }),
      ]);

      for (const project of projects) {
        entries.push({
          url: absoluteUrl(href({ locale, direction, section: workSection(direction), slug: project.slug }), origin),
          priority: 0.6,
        });
      }

      for (const article of articles) {
        // Только каноническое направление записи.
        if (article.primaryDirection !== direction) continue;
        entries.push({
          url: absoluteUrl(href({ locale, direction, section: 'blog', slug: article.slug }), origin),
          lastModified: article.publishedAt,
          priority: 0.6,
        });
      }
    }

    // Условия стоимости отдельных URL не имеют — они блоки на странице Pricing.
    await getPricing('business');
  }

  return entries;
}
