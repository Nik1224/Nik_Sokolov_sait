/**
 * Интерлиньяж крупных кеглей у кириллицы (BUSINESS).
 *
 * В прописных есть выносы в обе стороны, которых у латиницы нет: краткая над
 * «Й» поднимается выше прописных, ножки «Д», «Ц» и «Щ» уходят ниже базовой
 * линии. Интерлиньяж, подобранный по латинскому образцу, кажется плотным и
 * дорогим — и роняет строки друг на друга.
 *
 * Проверка меряет не число в токене, а сами чернила: сколько занимает строка
 * с обеими буквами и сколько между базовыми линиями. Так она переживёт и смену
 * гарнитуры, и смену заголовка в CMS.
 */

import { expect, test } from '@playwright/test';

test('строки заголовка не налезают друг на друга', async ({ page }) => {
  await page.goto('/ru/business');

  const metrics = await page.locator('h1').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;

    // Самый высокий знак сверху и самый глубокий снизу во всём русском капсе.
    const above = ctx.measureText('ЙЁ').actualBoundingBoxAscent / size;
    const below = ctx.measureText('ДЦЩ').actualBoundingBoxDescent / size;

    return { leading: parseFloat(cs.lineHeight) / size, ink: above + below };
  });

  // Между базовыми линиями должно умещаться всё, что строка занимает чернилами.
  expect(metrics.leading).toBeGreaterThanOrEqual(metrics.ink);
});
