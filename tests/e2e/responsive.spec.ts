/**
 * Адаптив и моторная доступность (ТЗ §11).
 *
 * Проверяется не «красиво ли», а измеримое: страница нигде не уезжает вбок,
 * touch-цели достаточного размера, а при zoom 200% и prefers-reduced-motion
 * содержимое остаётся доступным.
 */

import { expect, test } from '@playwright/test';

const PATHS = [
  '/ru',
  '/ru/business',
  '/ru/business/services/events-conferences',
  '/ru/business/cases/demo-industry-conference',
  '/ru/business/blog/demo-conference-backstage',
  '/ru/private/contact',
  '/ru/production/showreel',
];

const WIDTHS = [375, 768, 1024, 1440];

test.describe('нет горизонтальной прокрутки', () => {
  for (const width of WIDTHS) {
    test(`${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of PATHS) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${path} уезжает вбок`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test('zoom 200% не ломает страницу', async ({ page }) => {
  // Половинный вьюпорт эквивалентен двукратному увеличению на десктопе.
  await page.setViewportSize({ width: 720, height: 450 });

  for (const path of ['/ru', '/ru/business', '/ru/private/contact']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${path} уезжает вбок при zoom 200%`).toBeLessThanOrEqual(1);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('touch-цели в шапке не меньше 44×44', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильного взаимодействия');

  await page.goto('/ru/business');
  const menuButton = page.getByRole('button', { name: 'Открыть меню' });
  const box = await menuButton.boundingBox();

  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
});

test.describe('prefers-reduced-motion', () => {
  test('всё содержимое доступно без движения', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ru');

    // Карточки направлений на START не зависят от hover и анимации (§5.1).
    const main = page.getByRole('main');
    for (const label of ['Private', 'Business', 'Production']) {
      const link = main.getByRole('link', { name: new RegExp(label) });
      await expect(link).toBeVisible();
      await expect(link).toContainText(/\S/);
    }

    await page.goto('/ru/production/showreel');
    // Автовоспроизведения нет: видео стартует только по действию пользователя.
    await expect(page.locator('video[autoplay]')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });
});
