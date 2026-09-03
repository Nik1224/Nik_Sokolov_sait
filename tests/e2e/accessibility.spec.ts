/** Доступность: WCAG 2.2 AA как часть Definition of Done (ТЗ §11, §17, §19). */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  ['START', '/ru'],
  ['Home ветки', '/ru/business'],
  ['Портфолио business', '/ru/business/portfolio'],
  ['Кейс', '/ru/business/cases/demo-industry-conference'],
  ['Статья', '/ru/business/blog/demo-conference-backstage'],
  ['Стоимость', '/ru/private/pricing'],
  ['Контакты', '/ru/private/contact'],
  ['404', '/ru/nope'],
] as const;

for (const [name, path] of PAGES) {
  test(`${name}: нет нарушений WCAG 2.1 A/AA`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test('skip-link — первый элемент в tab-порядке и ведёт к содержимому', async ({ page }) => {
  await page.goto('/ru/business');
  await page.keyboard.press('Tab');

  const focused = page.locator(':focus');
  await expect(focused).toHaveText('К основному содержимому');
  await expect(focused).toHaveAttribute('href', '#main');
});

test('активный пункт меню помечен для ассистивных технологий', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'основное меню скрыто на мобильном');

  await page.goto('/ru/business/cases');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Кейсы' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
