/** Контентные критерии приёмки (ТЗ §17). */

import { expect, test } from '@playwright/test';

test('статья с двумя ветками доступна по обоим адресам, canonical — на основную', async ({
  page,
}) => {
  await page.goto('/ru/business/blog/demo-conference-backstage');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/ru\/business\/blog\/demo-conference-backstage$/,
  );

  await page.goto('/ru/production/blog/demo-conference-backstage');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Второй контекстный адрес отдаёт canonical основного направления.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/ru\/business\/blog\/demo-conference-backstage$/,
  );
});

test('запись не открывается в чужой ветке', async ({ page }) => {
  const response = await page.goto('/ru/private/blog/demo-conference-backstage');
  expect(response?.status()).toBe(404);
});

test('связь проект ↔ заметка видна в обе стороны', async ({ page }) => {
  await page.goto('/ru/business/cases/demo-industry-conference');
  const noteLink = page.getByRole('link', { name: /Как снимают конференцию/ });
  await expect(noteLink).toBeVisible();
  await noteLink.click();

  await expect(page).toHaveURL('/ru/business/blog/demo-conference-backstage');
  await expect(page.getByRole('link', { name: /Отраслевая конференция/ })).toBeVisible();
});

test('hreflang и x-default проставлены на локализованной странице', async ({ page }) => {
  await page.goto('/ru/business/cases/demo-industry-conference');

  for (const lang of ['ru', 'en', 'x-default']) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
  }
});

test('на странице ровно один h1 и уникальный title', async ({ page }) => {
  const paths = [
    '/ru',
    '/ru/business',
    '/ru/business/services/events-conferences',
    '/ru/business/cases/demo-industry-conference',
    '/ru/business/blog/demo-conference-backstage',
    '/ru/private/pricing',
    '/ru/production/showreel',
  ];

  const titles = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    titles.add(await page.title());
  }
  expect(titles.size).toBe(paths.length);
});

test('английская страница без перевода показывает русский текст с меткой', async ({ page }) => {
  await page.goto('/en/private/blog/demo-location-scouting');

  await expect(page.getByText('This page is currently available in Russian only.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('локацию');
});

test('фильтр листинга работает и отражается в адресе', async ({ page }) => {
  await page.goto('/ru/private/portfolio');
  const before = await page.getByRole('article').count();

  // Ссылка ищется в панели фильтров: название категории встречается и в карточках.
  await page.getByRole('navigation', { name: 'Фильтр' }).getByRole('link', { name: 'Свадьбы' }).click();
  await expect(page).toHaveURL(/category=wedding/);

  const after = await page.getByRole('article').count();
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
});

test('все изображения имеют размеры и alt-атрибут', async ({ page }) => {
  await page.goto('/ru/business/cases/demo-industry-conference');

  const images = page.locator('img');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index++) {
    const image = images.nth(index);
    // alt может быть пустым (декоративное изображение), но должен быть задан.
    await expect(image).toHaveAttribute('alt', /.*/);
    expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
  }
});

test('видео не грузит сторонний плеер до действия пользователя', async ({ page }) => {
  await page.goto('/ru/production/showreel');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Смотреть видео/ }).first()).toBeVisible();
});

test('sitemap содержит только канонический адрес статьи', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const body = await response.text();

  expect(body).toContain('/ru/business/blog/demo-conference-backstage');
  expect(body).not.toContain('/ru/production/blog/demo-conference-backstage');
});

test('контакты видны в футере и кликабельны', async ({ page }) => {
  await page.goto('/ru/business');

  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: /\+7 989 527 70 70/ }).first()).toHaveAttribute(
    'href',
    'tel:+79895277070',
  );
  await expect(footer.getByRole('link', { name: /Telegram/ })).toHaveAttribute(
    'href',
    'https://t.me/Nik_Sokolov_pro',
  );
  // Видимого дублирования номера быть не должно: WhatsApp подписан названием,
  // а сам номер остаётся в доступном имени ссылки для скринридера.
  const visibleText = await footer.evaluate((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.sr-only').forEach((element) => element.remove());
    return clone.textContent ?? '';
  });
  expect(visibleText.match(/\+7 989 527 70 70/g) ?? []).toHaveLength(1);
  await expect(footer.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute(
    'href',
    'https://wa.me/79895277070',
  );
  await expect(footer.getByRole('link', { name: 'Политика конфиденциальности' })).toBeVisible();
});

test('на странице контактов есть прямые контакты и география', async ({ page }) => {
  await page.goto('/ru/private/contact');

  await expect(page.getByText('Москва / Санкт-Петербург').first()).toBeVisible();
  await expect(page.getByRole('complementary').getByRole('link').first()).toBeVisible();
});

test('заявка отправляется и форма очищается', async ({ page }) => {
  await page.goto('/ru/private/contact');

  await page.getByLabel('Имя').fill('Тест');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Сообщение').fill('Проверка формы');
  await page.getByLabel(/Согласен на обработку/).check();
  await page.getByRole('button', { name: 'Отправить заявку' }).click();

  await expect(page.getByText('Заявка отправлена')).toBeVisible();
  // Поля очищены, чтобы случайно не отправить дубль.
  await expect(page.getByLabel('Имя')).toHaveValue('');
});

test('незаполненная форма не отправляется и объясняет почему', async ({ page }) => {
  await page.goto('/ru/private/contact');
  await page.getByRole('button', { name: 'Отправить заявку' }).click();

  await expect(page.getByText('Обязательное поле').first()).toBeVisible();
  await expect(page.getByText('Заявка отправлена')).toHaveCount(0);
});
