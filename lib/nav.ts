/** Состав и порядок пунктов меню ветки (ТЗ §4, §8: `Direction.nav`). */

import type { DirectionDoc } from '@/content/types';
import {
  DIRECTION_SECTIONS,
  SECTIONS_OUTSIDE_NAV,
  type Direction,
  type Section,
  isSection,
} from './site';

/**
 * Подписи пунктов — строки интерфейса (словарь), а порядок и состав задаёт
 * CMS через `navOrder`. Так перевод меню не заводится вручную для каждой ветки.
 */
export function navSections(direction: Direction, doc?: DirectionDoc | null): Section[] {
  const hidden = SECTIONS_OUTSIDE_NAV[direction];
  const available = DIRECTION_SECTIONS[direction].filter((section) => !hidden.includes(section));
  const order = doc?.navOrder;
  if (!order || order.length === 0) return [...available];

  const requested = order.filter(isSection).filter((section) => available.includes(section));
  const rest = available.filter((section) => !requested.includes(section));
  return [...requested, ...rest];
}
