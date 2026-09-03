/**
 * Критерии приёмки навигации (ТЗ §17).
 * Каждый тест соответствует пункту чек-листа.
 */

import { expect, test } from '@playwright/test';

test('на / видны три равнозначных направления, каждое ведёт на свою Home', async ({ page }) => {
  await page.goto('/');

  const main = page.getByRole('main');
  for (const label of ['Private', 'Business', 'Production']) {
    await expect(main.getByRole('link', { name: new RegExp(label) })).toBeVisible();
  }

  await main.getByRole('link', { name: /Business/ }).click();
  await expect(page).toHaveURL('/ru/business');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('логотип ведёт на Home ветки со страницы кейса', async ({ page }) => {
  await page.goto('/ru/business/cases/demo-industry-conference');

  await page.getByRole('banner').getByRole('link', { name: 'Nikita Sokolov' }).click();
  await expect(page).toHaveURL('/ru/business');
});

test('логотип ведёт на Home ветки со страницы статьи', async ({ page }) => {
  await page.goto('/ru/production/blog/demo-production-note');

  await page.getByRole('banner').getByRole('link', { name: 'Nikita Sokolov' }).click();
  await expect(page).toHaveURL('/ru/production');
});

test('переключатель направления доступен с клавиатуры и озвучивает активное', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на мобильном направление переключается в меню');

  await page.goto('/ru/business');

  const toggle = page.getByRole('banner').getByRole('button', { name: /Выбрать направление/i });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const current = page.getByRole('banner').getByRole('link', { name: 'Business' });
  await expect(current).toHaveAttribute('aria-current', 'true');

  await page.getByRole('banner').getByRole('link', { name: 'Production' }).click();
  await expect(page).toHaveURL('/ru/production');
});

test('«Все направления» возвращает на START', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на мобильном ссылка живёт в меню');

  await page.goto('/ru/private');
  await page.getByRole('banner').getByRole('button', { name: /Выбрать направление/i }).click();
  await page.getByRole('banner').getByRole('link', { name: 'Все направления' }).click();
  await expect(page).toHaveURL('/ru');
});

test('RU/EN открывает эквивалент страницы и не сбрасывает на Home', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на мобильном переключатель языка в меню');

  await page.goto('/ru/business/cases/demo-industry-conference');
  await page.getByRole('banner').getByRole('link', { name: 'EN' }).click();

  await expect(page).toHaveURL('/en/business/cases/demo-industry-conference');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('переключение языка сохраняет фильтр в query', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на мобильном переключатель языка в меню');

  await page.goto('/ru/business/blog?type=backstage');
  await page.getByRole('banner').getByRole('link', { name: 'EN' }).click();

  await expect(page).toHaveURL('/en/business/blog?type=backstage');
});

test('раздел, которого у ветки нет, отдаёт 404', async ({ page }) => {
  const response = await page.goto('/ru/private/cases');
  expect(response?.status()).toBe(404);
});

test('404 предлагает три направления', async ({ page }) => {
  await page.goto('/ru/nope');
  for (const label of ['Private', 'Business', 'Production']) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

test('мобильное меню содержит разделы, направления и язык', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильной навигации');

  await page.goto('/ru/business');
  await page.getByRole('button', { name: 'Открыть меню' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link', { name: 'Кейсы' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Все направления' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'EN' })).toBeVisible();

  // Escape закрывает нативный <dialog> без собственной обработки клавиш.
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('PRIVATE открывается в светлой теме, остальные ветки — в тёмной', async ({ page }) => {
  await page.goto('/ru/private');
  const light = await page
    .locator('[data-theme="private"]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  await page.goto('/ru/business');
  const dark = await page
    .locator('[data-theme="business"]')
    .evaluate((el) => getComputedStyle(el).backgroundColor);

  expect(light).not.toBe(dark);
  // Светлая подложка PRIVATE: сумма каналов заведомо выше, чем у тёмной.
  const sum = (rgb: string) =>
    (rgb.match(/\d+/g) ?? []).slice(0, 3).reduce((a, v) => a + Number(v), 0);
  expect(sum(light)).toBeGreaterThan(600);
  expect(sum(dark)).toBeLessThan(100);
});

test('переход краской закрывает экран прежде, чем меняется страница', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'замер по одному разрешению');

  await page.goto('/ru');
  await page.waitForTimeout(600);

  await page.evaluate(() => {
    (window as unknown as { __seen: string[] }).__seen = [];
    const layer = document.querySelector('[data-paint-layer]') as HTMLElement;
    const sheet = layer.firstElementChild as HTMLElement;
    const tick = () => {
      const shift = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42;
      const showing = getComputedStyle(layer).visibility === 'visible';
      // Запоминаем адрес в моменты, когда краска видна, но экран ещё не закрыт.
      // После завершения слой прячется и сбрасывается наверх — это не в счёт.
      if (showing && shift < -20) {
        (window as unknown as { __seen: string[] }).__seen.push(location.pathname);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.getByRole('main').getByRole('link', { name: /Private/ }).click();
  await expect(page).toHaveURL('/ru/private');

  const seen = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
  // Пока экран не закрыт, адрес обязан оставаться прежним — иначе виден скачок.
  expect(new Set(seen.filter((p) => p !== '/ru'))).toEqual(new Set());
});

test('слой перехода скрыт от ассистивных технологий', async ({ page }) => {
  await page.goto('/ru');
  await expect(page.locator('[data-paint-layer]')).toHaveAttribute('aria-hidden', 'true');
});

test('при уменьшенной анимации переход мгновенный, без краски', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru');

  await page.getByRole('main').getByRole('link', { name: /Private/ }).click();
  await expect(page).toHaveURL('/ru/private');

  // Слой краски даже не показывался.
  await expect(page.locator('[data-paint-layer]')).toHaveCSS('visibility', 'hidden');
});
