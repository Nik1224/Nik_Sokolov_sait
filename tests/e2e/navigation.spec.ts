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
  const response = await page.goto('/ru/private/services');
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
