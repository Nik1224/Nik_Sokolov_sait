/**
 * Метаданные и структурированные данные (ТЗ §12).
 *
 * Ключевые правила:
 *  • у каждой страницы уникальные title / H1 / description;
 *  • hreflang ru/en + x-default на каждой локализованной странице;
 *  • у статьи, доступной в нескольких ветках, canonical указывает на адрес
 *    основного направления (§6) — так дубли не конкурируют между собой.
 */

import type { Metadata } from 'next';
import type { ImageRef, SeoFields } from '@/content/types';
import { localizedString } from './i18n/localize';
import { imageSrc } from './media';
import { absoluteUrl } from './routing';
import { DEFAULT_LOCALE, LOCALES, type Locale, siteUrl } from './site';

const OG_LOCALE: Record<Locale, string> = { ru: 'ru_RU', en: 'en_US' };

export type MetadataInput = {
  locale: Locale;
  /** Путь текущей страницы, начиная со слэша. */
  path: string;
  title: string;
  description?: string;
  /** Если задан — canonical ведёт сюда, а не на текущий путь (§6). */
  canonicalPath?: string;
  image?: ImageRef | null;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
};

export function buildMetadata(input: MetadataInput): Metadata {
  const origin = siteUrl();
  const canonical = absoluteUrl(input.canonicalPath ?? input.path, origin);

  // Эквивалент страницы на другом языке: тот же путь, другой языковой сегмент.
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const segments = input.path.split('/').filter(Boolean);
    segments[0] = locale;
    languages[locale] = absoluteUrl('/' + segments.join('/'), origin);
  }
  languages['x-default'] = languages[DEFAULT_LOCALE];

  const image = input.image ? imageSrc(input.image, 1200) : undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical, languages },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? 'website',
      title: input.title,
      description: input.description,
      url: canonical,
      locale: OG_LOCALE[input.locale],
      siteName: 'Nikita Sokolov',
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      publishedTime: input.publishedTime,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: input.title,
      description: input.description,
      images: image ? [image] : undefined,
    },
  };
}

/** Достаёт SEO-поля записи с откатом на её собственный заголовок. */
export function seoText(
  seo: SeoFields | undefined,
  locale: Locale,
  fallbackTitle: string,
  fallbackDescription = '',
): { title: string; description: string; noIndex: boolean } {
  return {
    title: localizedString(seo?.title, locale) || fallbackTitle,
    description: localizedString(seo?.description, locale) || fallbackDescription,
    noIndex: seo?.noIndex === true,
  };
}

/* --- JSON-LD (§12) -------------------------------------------------------- */

type JsonLd = Record<string, unknown>;

export function personJsonLd(name: string, description: string, url: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description,
    url,
    jobTitle: 'Photographer, videographer',
  };
}

export function professionalServiceJsonLd(name: string, description: string, url: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name,
    description,
    url,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  author: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished,
    author: { '@type': 'Person', name: input.author },
  };
}

export function videoJsonLd(input: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    thumbnailUrl: [input.thumbnailUrl],
    uploadDate: input.uploadDate,
    duration: input.duration,
    contentUrl: input.contentUrl,
  };
}
