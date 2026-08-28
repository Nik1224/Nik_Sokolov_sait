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
  'albums',
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
  private: ['portfolio', 'albums', 'pricing', 'blog', 'about', 'contact'],
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
 * Приводит значение из окружения к origin вида `https://домен`.
 * Возвращает null для всего, из чего нельзя собрать адрес: пустой строки,
 * пробелов, мусора. Протокол дописывается, если его забыли указать.
 */
const LOCAL_ORIGIN = 'http://localhost:3000';

/** Предупреждение о ненастроенном домене печатается один раз на процесс. */
let warnedAboutMissingOrigin = false;

function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

/**
 * Канонический домен для canonical, hreflang, sitemap и OG (ТЗ §12).
 *
 * Порядок: явная настройка → домен, который сообщает хостинг → локальный адрес.
 *
 * Результат всегда пригоден для `new URL()`. Это не перестраховка: переменная,
 * заведённая на хостинге с пустым значением, роняла сборку целиком — пустая
 * строка проходила мимо запасного значения и доходила до `new URL('')`.
 */
export function siteUrl(): string {
  const resolved =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (resolved) return resolved;

  // Заметная строка в логе сборки: с localhost в canonical и sitemap сайт
  // выкладывать нельзя, и молча это пропускать не стоит.
  if (process.env.NODE_ENV === 'production' && !warnedAboutMissingOrigin) {
    warnedAboutMissingOrigin = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[site] Домен не определён. Задайте NEXT_PUBLIC_SITE_URL — иначе в canonical, ' +
        'hreflang и sitemap попадёт http://localhost:3000.',
    );
  }
  return LOCAL_ORIGIN;
}

/**
 * Готовый URL для `metadataBase`. Отдельная функция ровно потому, что
 * `new URL()` на некорректном значении роняет ВСЮ сборку — одна страница с
 * плохим адресом не должна стоить сайта целиком.
 */
export function siteUrlObject(): URL {
  try {
    return new URL(siteUrl());
  } catch {
    return new URL(LOCAL_ORIGIN);
  }
}
