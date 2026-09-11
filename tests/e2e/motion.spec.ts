/**
 * Движение, которое начинается само (BUSINESS): бегущая строка заказчиков и
 * ход ленты портфолио.
 *
 * Проверяется не вид, а обещания, которые легко потерять при правке: такое
 * движение обязано останавливаться (WCAG 2.2.2), а при «уменьшить движение» —
 * не начинаться вовсе, не пряча при этом содержимое.
 */

import { expect, test } from '@playwright/test';

const BAND = 'С КЕМ РАБОТАЛИ';

test('движение останавливается кнопкой', async ({ page }) => {
  await page.goto('/ru/business');
  const band = page.locator('section').filter({ hasText: BAND }).first();
  await band.scrollIntoViewIfNeeded();

  const button = band.getByRole('button');
  await expect(button).toHaveAttribute('aria-pressed', 'false');

  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');

  const state = await band
    .locator('.marquee-track')
    .first()
    .evaluate((el) => getComputedStyle(el).animationPlayState);
  expect(state).toBe('paused');
});

test('при «уменьшить движение» полоса стоит, а названия остаются доступны', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/business');
  const band = page.locator('section').filter({ hasText: BAND }).first();
  await band.scrollIntoViewIfNeeded();

  const marquee = band.locator('.marquee');
  expect(
    await marquee.locator('.marquee-track').first().evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');

  // Дорожка-копия нужна только петле: без движения она превращается в повтор.
  const visible = await marquee.evaluate(
    (el) =>
      [...el.querySelectorAll('.marquee-track')].filter(
        (node) => getComputedStyle(node).display !== 'none',
      ).length,
  );
  expect(visible).toBe(1);

  // Дальние названия достаются прокруткой, а не остаются за обрезом.
  expect(await marquee.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
});

/* --- Лента портфолио ------------------------------------------------------ */

test('лента едет сама и встаёт под курсором', async ({ page }) => {
  await page.goto('/ru/business');
  const rail = page.locator('.rail');
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const before = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1400);
  const after = await rail.evaluate((el) => el.scrollLeft);
  expect(after).toBeGreaterThan(before);

  await rail.hover();
  await page.waitForTimeout(400);
  const held = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1000);
  // Под курсором лента стоит: иначе кадр уезжает из-под того, кто на него смотрит.
  expect(Math.abs((await rail.evaluate((el) => el.scrollLeft)) - held)).toBeLessThan(2);
});

test('лента не едет при «уменьшить движение»', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/business');
  const rail = page.locator('.rail');
  await rail.scrollIntoViewIfNeeded();

  const before = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1400);
  expect(Math.abs((await rail.evaluate((el) => el.scrollLeft)) - before)).toBeLessThan(2);
});

test('стрелка листает ленту, кнопка держит её на месте', async ({ page }) => {
  await page.goto('/ru/business');
  const rail = page.locator('.rail');
  await rail.scrollIntoViewIfNeeded();
  const group = page.getByRole('group', { name: /лента/i });

  const before = await rail.evaluate((el) => el.scrollLeft);
  await group.getByRole('button', { name: /следующ/i }).click();
  await page.waitForTimeout(700);
  // Шаг — ширина карточки: заметно больше, чем лента проезжает сама.
  expect(await rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before + 100);

  const pause = group.getByRole('button', { name: /движение/i });
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');

  // Курсор в стороне: иначе лента стояла бы и без кнопки.
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  const held = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1600);
  expect(Math.abs((await rail.evaluate((el) => el.scrollLeft)) - held)).toBeLessThan(2);
});
