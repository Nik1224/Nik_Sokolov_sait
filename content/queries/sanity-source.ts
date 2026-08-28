/**
 * Источник контента на Sanity (ТЗ §8).
 *
 * GROQ-проекции приводят документы к тем же типам, что отдают фикстуры,
 * поэтому вся логика связей и фильтров выше по стеку остаётся одна.
 */

import { groq } from 'next-sanity';
import type {
  Album,
  Article,
  ArticleType,
  Category,
  DirectionDoc,
  GlobalSettings,
  Page,
  Person,
  PricingEntry,
  Project,
  Redirect,
  Service,
  Testimonial,
  WorkFormat,
} from '../types';
import { getClient } from './sanity-client';
import { compactSlugs, mapImage, mapMedia, mapMediaList } from './sanity-map';
import type { ContentSource } from './source';

/* --- Фрагменты ----------------------------------------------------------- */

const IMAGE = groq`{ hotspot, asset->{ url, metadata { dimensions, lqip } } }`;

const MEDIA = groq`{
  _key, type, decorative, alt, caption, credit, rights,
  provider, videoId, url, loopSrc, durationSeconds,
  image ${IMAGE},
  poster ${IMAGE}
}`;

const SEO = groq`{ title, description, noIndex, ogImage ${IMAGE} }`;

async function fetchQuery<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const client = await getClient();
  return client.fetch<T>(query, params, {
    // Теги позволяют точечно сбрасывать кэш вебхуком при публикации.
    next: { tags: ['content'] },
  });
}

function mapSeo(raw: { ogImage?: unknown } | null | undefined) {
  if (!raw) return undefined;
  const { ogImage, ...rest } = raw as Record<string, unknown>;
  const mapped = mapImage((ogImage ?? null) as never);
  return { ...rest, ogImage: mapped ?? undefined } as Project['seo'];
}

/* --- Запросы -------------------------------------------------------------- */

const GLOBAL_SETTINGS = groq`*[_type == "globalSettings"][0]{
  siteName, descriptor, location, contacts, socials, legalLinks, analytics, featureFlags,
  showreel ${MEDIA},
  defaultSeo ${SEO}
}`;

const DIRECTIONS = groq`*[_type == "direction"]{
  _id, key, title, lead, gatewayDescription, highlights, navOrder, order, isDemo, pricingGroups,
  hero ${MEDIA}, gatewayMedia ${MEDIA}, seo ${SEO}
}`;

const CATEGORIES = groq`*[_type == "category"]{
  _id, "slug": slug.current, title, directions, order, isDemo
}`;

const ALBUMS = groq`*[_type == "album"]{
  _id, "slug": slug.current, direction, title, date, location, url, order, isDemo,
  cover ${MEDIA}
}`;

const ARTICLE_TYPES = groq`*[_type == "articleType"]{
  _id, "slug": slug.current, title, order, isDemo
}`;

const WORK_FORMATS = groq`*[_type == "workFormat"]{
  _id, "slug": slug.current, title, order, isDemo
}`;

const SERVICES = groq`*[_type == "service"]{
  _id, "slug": slug.current, status, title, summary, body, deliverables,
  process, faq, leadTime, order, isDemo,
  "formatSlugs": formats[]->slug.current,
  "pricingSlug": pricing->slug.current,
  hero ${MEDIA}, gallery[] ${MEDIA}, seo ${SEO}
}`;

const PROJECTS = groq`*[_type == "project"]{
  _id, "slug": slug.current, status, title, directions, year, client, role, lead,
  challenge, solution, result, featured, order, isDemo,
  "categorySlugs": categories[]->slug.current,
  "serviceSlugs": services[]->slug.current,
  "formatSlugs": formats[]->slug.current,
  cover ${MEDIA}, media[] ${MEDIA}, seo ${SEO},
  credits[]{ role, person->{ _id, displayName, role, url, visibility, isDemo } }
}`;

const ARTICLES = groq`*[_type == "article"]{
  _id, "slug": slug.current, status, title, directions, primaryDirection,
  excerpt, body, author, publishedAt, order, isDemo,
  "typeSlug": articleType->slug.current,
  "projectSlugs": projects[]->slug.current,
  cover ${MEDIA}, seo ${SEO}
}`;

const PRICING = groq`*[_type == "pricingEntry"]{
  _id, "slug": slug.current, direction, kind, groupSlug, format, title, description, price, currency, priceFrom,
  unit, includes, disclaimer, ctaLabel, order, active, isDemo
}`;

const TESTIMONIALS = groq`*[_type == "testimonial"]{
  _id, author, text, directions, source, order, isDemo
}`;

const PAGES = groq`*[_type == "page"]{
  _id, "slug": slug.current, status, pageType, direction, title, lead, body,
  order, isDemo, hero ${MEDIA}, seo ${SEO}
}`;

const REDIRECTS = groq`*[_type == "redirect"]{ _id, from, to, code, note, createdAt }`;

/* --- Источник ------------------------------------------------------------- */

type Raw = Record<string, unknown>;

export const sanitySource: ContentSource = {
  name: 'sanity',

  async globalSettings() {
    const raw = await fetchQuery<Raw | null>(GLOBAL_SETTINGS);
    if (!raw) {
      // Пустой, но валидный объект: сайт не должен падать из-за незаполненных настроек.
      return {
        siteName: 'Nikita Sokolov',
        descriptor: {},
        contacts: [],
        socials: [],
        legalLinks: [],
        defaultSeo: {},
        featureFlags: {},
      };
    }
    return {
      ...(raw as unknown as GlobalSettings),
      contacts: (raw.contacts as GlobalSettings['contacts']) ?? [],
      socials: (raw.socials as GlobalSettings['socials']) ?? [],
      legalLinks: (raw.legalLinks as GlobalSettings['legalLinks']) ?? [],
      showreel: mapMedia(raw.showreel as never) ?? undefined,
      defaultSeo: mapSeo(raw.defaultSeo as Raw) ?? {},
      featureFlags: (raw.featureFlags as GlobalSettings['featureFlags']) ?? {},
    };
  },

  async directions() {
    const raw = await fetchQuery<Raw[]>(DIRECTIONS);
    return raw.map((item) => ({
      ...(item as unknown as DirectionDoc),
      hero: mapMedia(item.hero as never) ?? undefined,
      gatewayMedia: mapMedia(item.gatewayMedia as never) ?? undefined,
      seo: mapSeo(item.seo as Raw),
    }));
  },

  async categories() {
    return fetchQuery<Category[]>(CATEGORIES);
  },

  async albums() {
    const raw = await fetchQuery<Raw[]>(ALBUMS);
    return raw.map((item) => ({
      ...(item as unknown as Album),
      cover: mapMedia(item.cover as never) ?? undefined,
    }));
  },

  async articleTypes() {
    return fetchQuery<ArticleType[]>(ARTICLE_TYPES);
  },

  async workFormats() {
    return fetchQuery<WorkFormat[]>(WORK_FORMATS);
  },

  async services() {
    const raw = await fetchQuery<Raw[]>(SERVICES);
    return raw.map((item) => ({
      ...(item as unknown as Service),
      direction: 'business' as const,
      deliverables: (item.deliverables as Service['deliverables']) ?? [],
      process: (item.process as Service['process']) ?? [],
      faq: (item.faq as Service['faq']) ?? [],
      formatSlugs: compactSlugs(item.formatSlugs as (string | null)[]),
      hero: mapMedia(item.hero as never) ?? undefined,
      gallery: mapMediaList(item.gallery as never),
      seo: mapSeo(item.seo as Raw),
    }));
  },

  async projects() {
    const raw = await fetchQuery<Raw[]>(PROJECTS);
    return raw
      .map((item): Project | null => {
        const cover = mapMedia(item.cover as never);
        // Без обложки карточка сломала бы сетку — такую запись пропускаем.
        if (!cover) return null;
        // В credits попадают только те, кто разрешил публикацию (§8).
        const credits = ((item.credits as { role?: Person['role']; person?: Person }[]) ?? [])
          .filter((entry) => entry.person?.visibility === 'public')
          .map((entry) => ({ person: entry.person as Person, role: entry.role }));
        return {
          ...(item as unknown as Project),
          cover,
          media: mapMediaList(item.media as never),
          categorySlugs: compactSlugs(item.categorySlugs as (string | null)[]),
          serviceSlugs: compactSlugs(item.serviceSlugs as (string | null)[]),
          formatSlugs: compactSlugs(item.formatSlugs as (string | null)[]),
          credits,
          seo: mapSeo(item.seo as Raw),
        };
      })
      .filter((item): item is Project => item !== null);
  },

  async articles() {
    const raw = await fetchQuery<Raw[]>(ARTICLES);
    return raw
      .map((item): Article | null => {
        const cover = mapMedia(item.cover as never);
        if (!cover) return null;
        return {
          ...(item as unknown as Article),
          cover,
          projectSlugs: compactSlugs(item.projectSlugs as (string | null)[]),
          seo: mapSeo(item.seo as Raw),
        };
      })
      .filter((item): item is Article => item !== null);
  },

  async pricing() {
    return fetchQuery<PricingEntry[]>(PRICING);
  },

  async testimonials() {
    return fetchQuery<Testimonial[]>(TESTIMONIALS);
  },

  async pages() {
    const raw = await fetchQuery<Raw[]>(PAGES);
    return raw.map((item) => ({
      ...(item as unknown as Page),
      hero: mapMedia(item.hero as never) ?? undefined,
      seo: mapSeo(item.seo as Raw),
    }));
  },

  async redirects() {
    return fetchQuery<Redirect[]>(REDIRECTS);
  },
};
