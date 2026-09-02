/**
 * Построение и разбор URL (ТЗ §6).
 *
 * Схема: /{locale}/{direction}/{section}/{slug}
 * Статья живёт в контекстном URL своей ветки; canonical указывает на основное
 * направление записи — см. lib/seo.ts.
 */

import {
  DEFAULT_LOCALE,
  type Direction,
  type Locale,
  type Section,
  isDirection,
  isLocale,
  isSection,
} from './site';

export type RouteTarget =
  | { locale: Locale }
  | { locale: Locale; direction: Direction }
  | { locale: Locale; direction: Direction; section: Section }
  | { locale: Locale; direction: Direction; section: Section; slug: string };

/** Единственный способ собрать внутренний адрес. */
export function href(target: RouteTarget): string {
  const parts: string[] = [target.locale];
  if ('direction' in target) parts.push(target.direction);
  if ('section' in target) parts.push(target.section);
  if ('slug' in target && target.slug) parts.push(target.slug);
  return '/' + parts.join('/');
}

/** START текущего языка. «Все направления» в переключателе ведёт сюда (§3.1). */
export function startHref(locale: Locale): string {
  return href({ locale });
}

/** Home ветки. Логотип внутри ветки ведёт всегда сюда (§4). */
export function directionHomeHref(locale: Locale, direction: Direction): string {
  return href({ locale, direction });
}

/**
 * Визитка, которую организатор пересылает паре: короткий адрес без ветки и
 * раздела. Живёт рядом с ветками, а не внутри — её открывает человек, который
 * про сайт ещё ничего не знает, и лишние сегменты в такой ссылке только мешают.
 */
export function cardHref(locale: Locale): string {
  return `/${locale}/nikita`;
}

export type ParsedRoute = {
  locale: Locale;
  direction: Direction | null;
  section: Section | null;
  slug: string | null;
};

/**
 * Разбор пути. Корень `/` — это START на русском: next.config переписывает
 * его на `/ru`, поэтому у пути без языкового префикса язык по умолчанию.
 */
export function parseRoute(pathname: string): ParsedRoute {
  const segments = pathname.split('/').filter(Boolean);

  const locale = isLocale(segments[0]) ? segments[0] : DEFAULT_LOCALE;
  const rest = isLocale(segments[0]) ? segments.slice(1) : segments;

  const direction = isDirection(rest[0]) ? rest[0] : null;
  const section = direction && isSection(rest[1]) ? rest[1] : null;
  const slug = section && rest[2] ? rest[2] : null;

  return { locale, direction, section, slug };
}

/**
 * Эквивалент текущей страницы на другом языке (§4, §15.1).
 * Меняется только языковой сегмент — пользователь остаётся на той же странице,
 * его не сбрасывает на Home.
 */
export function equivalentPath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return `/${targetLocale}`;

  if (isLocale(segments[0])) {
    segments[0] = targetLocale;
  } else {
    segments.unshift(targetLocale);
  }
  return '/' + segments.join('/');
}

/** Тот же эквивалент, но с сохранением query и якоря (§4). */
export function equivalentUrl(
  pathname: string,
  targetLocale: Locale,
  search = '',
  hash = '',
): string {
  const normalizedSearch = search && !search.startsWith('?') ? `?${search}` : search;
  const normalizedHash = hash && !hash.startsWith('#') ? `#${hash}` : hash;
  return equivalentPath(pathname, targetLocale) + normalizedSearch + normalizedHash;
}

/** Абсолютный адрес для canonical, hreflang, sitemap и OG. */
export function absoluteUrl(path: string, origin: string): string {
  return origin.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
}
