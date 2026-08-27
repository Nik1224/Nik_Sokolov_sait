/**
 * Разрешение локализованных полей CMS (ТЗ §8.1) и единый режим отсутствующего
 * перевода (§4.1, §18).
 *
 * Подтверждённое решение: если английской версии нет, показываем русскую
 * с видимой меткой. Режим единый для всего сайта — переключается ЗДЕСЬ и
 * нигде больше.
 */

import { DEFAULT_LOCALE, type Locale } from '../site';

/** Локализованное поле CMS: `{ ru: ..., en: ... }`. */
export type LocaleField<T> = Partial<Record<Locale, T | null>>;

export type Resolved<T> = {
  value: T | null;
  /** true — показан текст языка по умолчанию вместо запрошенного. */
  isFallback: boolean;
};

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function resolveLocalized<T>(
  field: LocaleField<T> | null | undefined,
  locale: Locale,
): Resolved<T> {
  if (!field) return { value: null, isFallback: false };

  const requested = field[locale];
  if (!isEmpty(requested)) return { value: requested as T, isFallback: false };

  if (locale === DEFAULT_LOCALE) return { value: null, isFallback: false };

  const fallback = field[DEFAULT_LOCALE];
  if (!isEmpty(fallback)) return { value: fallback as T, isFallback: true };

  return { value: null, isFallback: false };
}

/** Значение без информации о fallback — для мест, где метка не нужна (alt, SEO). */
export function localized<T>(
  field: LocaleField<T> | null | undefined,
  locale: Locale,
): T | null {
  return resolveLocalized(field, locale).value;
}

/** Строка с гарантией непустоты — для подписей, где `null` сломал бы разметку. */
export function localizedString(
  field: LocaleField<string> | null | undefined,
  locale: Locale,
  fallback = '',
): string {
  return localized(field, locale) ?? fallback;
}

/** Есть ли собственный перевод — используется листингами и sitemap. */
export function hasTranslation<T>(
  field: LocaleField<T> | null | undefined,
  locale: Locale,
): boolean {
  return !!field && !isEmpty(field[locale]);
}

/**
 * Показывать ли метку «доступно только на русском» на странице целиком.
 * Считаем по основным полям записи, а не по каждой подписи: одна
 * непереведённая подпись к фото — не повод помечать всю страницу.
 */
export function pageNeedsFallbackNotice(
  primaryFields: Array<LocaleField<unknown> | null | undefined>,
  locale: Locale,
): boolean {
  if (locale === DEFAULT_LOCALE) return false;
  return primaryFields.some((field) => resolveLocalized(field, locale).isFallback);
}

/** Форматирование дат под язык страницы (§8.1: дата — общее поле). */
export function formatDate(value: string | Date | null | undefined, locale: Locale): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
