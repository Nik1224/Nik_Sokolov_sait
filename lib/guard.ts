/**
 * Гарды маршрутов (ТЗ §3, §4).
 *
 * Раздел, которого у ветки нет (например, /private/cases), отдаёт 404,
 * а не редирект: адрес неверный, и подменять намерение пользователя нельзя.
 */

import { notFound } from 'next/navigation';
import {
  DIRECTIONS,
  LOCALES,
  type Direction,
  type Locale,
  type Section,
  isDirection,
  isLocale,
  isSectionAvailable,
} from './site';

export type DirectionRouteParams = { locale: string; direction: string };

export async function resolveDirectionRoute(
  params: Promise<DirectionRouteParams>,
  section?: Section,
): Promise<{ locale: Locale; direction: Direction }> {
  const { locale, direction } = await params;

  if (!isLocale(locale) || !isDirection(direction)) notFound();
  if (section && !isSectionAvailable(direction, section)) notFound();

  return { locale, direction };
}

/** Тот же гард для generateMetadata, где вместо 404 нужно вернуть пустые данные. */
export async function tryResolveDirectionRoute(
  params: Promise<DirectionRouteParams>,
  section?: Section,
): Promise<{ locale: Locale; direction: Direction } | null> {
  const { locale, direction } = await params;
  if (!isLocale(locale) || !isDirection(direction)) return null;
  if (section && !isSectionAvailable(direction, section)) return null;
  return { locale, direction };
}

/**
 * Комбинации язык × направление, у которых раздел действительно есть.
 * Без этого сборка генерировала бы заведомые 404 вроде /private/cases.
 */
export function sectionStaticParams(section: Section) {
  return LOCALES.flatMap((locale) =>
    DIRECTIONS.filter((direction) => isSectionAvailable(direction, section)).map((direction) => ({
      locale,
      direction,
    })),
  );
}
