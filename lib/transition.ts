/**
 * Переход между направлениями «краской» (ТЗ §5.1 — выбор направления как
 * событие, а не просто клик).
 *
 * Событие отправляется карточкой, а слышит его слой в общем layout: только он
 * переживает смену страницы и может продолжить анимацию уже на новой.
 */

import type { Direction } from './site';

export const PAINT_EVENT = 'paint-transition';

/** Имя CSS-переменной с цветом краски. Цвета не дублируем — берём из темы. */
export const DIRECTION_PAINT: Record<Direction, string> = {
  private: '--private-ground',
  business: '--color-ink',
  production: '--color-ink',
};

export type PaintRequest = { href: string; colorVar: string };

export function requestPaintTransition(request: PaintRequest): void {
  window.dispatchEvent(new CustomEvent<PaintRequest>(PAINT_EVENT, { detail: request }));
}

/** Уважает системную настройку «уменьшить движение» (§10). */
export function motionAllowed(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
