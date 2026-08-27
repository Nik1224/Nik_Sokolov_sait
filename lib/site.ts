/**
 * Единый источник истины по языкам, направлениям и составу разделов (ТЗ §3, §4).
 * Всё построение URL и навигации опирается на эти константы — руками адреса
 * нигде не собираются.
 */

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Русский — основной язык и источник контента по умолчанию (§4.1). */
export const DEFAULT_LOCALE: Locale = 'ru';

export const DIRECTIONS = ['private', 'business', 'production'] as const;
export type Direction = (typeof DIRECTIONS)[number];

/** Разделы веток. Порядок задаёт порядок пунктов в основном меню. */
export const SECTIONS = [
  'portfolio',
  'services',
  'cases',
  'showreel',
  'work',
  'experience',
  'pricing',
  'blog',
  'about',
  'contact',
] as const;
export type Section = (typeof SECTIONS)[number];

/**
 * Какие разделы существуют у каждого направления (§3).
 * Обращение к разделу вне этого списка — 404, а не редирект: пользователь
 * попал по неверному адресу, и подменять его намерение мы не должны.
 */
export const DIRECTION_SECTIONS: Record<Direction, readonly Section[]> = {
  private: ['portfolio', 'pricing', 'blog', 'about', 'contact'],
  business: ['services', 'cases', 'pricing', 'blog', 'about', 'contact'],
  production: ['showreel', 'work', 'experience', 'blog', 'about', 'contact'],
};

/** Разделы, у которых есть страницы отдельных записей `/{section}/{slug}`. */
export const DETAIL_SECTIONS = ['services', 'cases', 'work', 'blog', 'portfolio'] as const;
export type DetailSection = (typeof DETAIL_SECTIONS)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function isDirection(value: unknown): value is Direction {
  return typeof value === 'string' && (DIRECTIONS as readonly string[]).includes(value);
}

export function isSection(value: unknown): value is Section {
  return typeof value === 'string' && (SECTIONS as readonly string[]).includes(value);
}

/** Доступен ли раздел в этой ветке. Гард для всех вложенных маршрутов. */
export function isSectionAvailable(direction: Direction, section: Section): boolean {
  return DIRECTION_SECTIONS[direction].includes(section);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ru' ? 'en' : 'ru';
}

/**
 * Канонический домен для canonical, hreflang, sitemap и OG (ТЗ §12).
 *
 * Порядок: явная настройка → домен, который подставляет хостинг → локальный
 * адрес. Средний шаг важен: без него первая же выкладка ушла бы в поиск с
 * адресами вида `http://localhost:3000`, и это пришлось бы переиндексировать.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Vercel сообщает домен проекта сам, ещё до подключения своего.
  const hosted = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (hosted) return `https://${hosted.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
