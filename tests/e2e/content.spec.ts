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
  await page.goto('/ru/business/cases');
  const before = await page.getByRole('article').count();

  // Ссылка ищется в панели фильтров: название категории встречается и в карточках.
  await page
    .getByRole('navigation', { name: 'Фильтр' })
    .getByRole('link', { name: 'Конференции и события' })
    .click();
  await expect(page).toHaveURL(/category=conference/);

  const after = await page.getByRole('article').count();
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
});

test('портфолио — галерея, кадр открывается на полный экран', async ({ page }) => {
  await page.goto('/ru/private/portfolio');

  const frames = page.locator('main figure button');
  // Портфолио — это кадры, а не карточки проектов.
  expect(await frames.count()).toBeGreaterThan(20);
  await expect(page.getByRole('article')).toHaveCount(0);

  await frames.nth(1).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toBeVisible();

  // Счётчик показывает место в наборе и меняется при листании.
  const counter = dialog.locator('p').first();
  const before = await counter.textContent();
  await page.keyboard.press('ArrowRight');
  await expect(counter).not.toHaveText(before ?? '');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('фильтр портфолио сужает галерею, а не ломает её', async ({ page }) => {
  await page.goto('/ru/private/portfolio');
  const all = await page.locator('main figure button').count();

  await page
    .getByRole('navigation', { name: 'Фильтр' })
    .getByRole('link', { name: 'Свадьбы' })
    .click();
  await expect(page).toHaveURL(/category=wedding/);
  expect(await page.locator('main figure button').count()).toBe(all);

  // У категории без снятых кадров галереи нет — и пустой сетки тоже.
  await page.goto('/ru/private/portfolio?category=love-story');
  expect(await page.locator('main figure button').count()).toBe(0);
});

test('кадры портфолио не грузятся в полном размере на телефоне', async ({ page }) => {
  await page.goto('/ru/private/portfolio');

  // Без srcset телефон тянул бы восемнадцатисотпиксельные кадры пачками.
  const srcset = await page.locator('main figure img').first().getAttribute('srcset');
  expect(srcset).toContain('600w');
  expect(srcset).toContain('1800w');
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

test('шоурил идёт фоном, сторонний плеер не грузится сам', async ({ page }) => {
  await page.goto('/ru');

  // Фон — наш файл, а не картинка с чужого CDN.
  const backdrop = page.locator('img[src^="/media/"]').first();
  await expect(backdrop).toBeVisible();

  // Пока не попросили — ни одного стороннего плеера на странице.
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('полный шоурил открывается по кнопке и грузит плеер только тогда', async ({ page }) => {
  await page.goto('/ru');

  await expect(page.getByText(/стороннего сервиса/)).toBeVisible();
  await page.getByRole('button', { name: /Смотреть шоурил со звуком/ }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /kinescope\.io\/embed\//);

  // Закрытие выгружает плеер: иначе видео продолжало бы играть за кадром.
  await page.keyboard.press('Escape');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('выбор направления остаётся в первом экране (§5.1)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на мобильном карточки идут вертикально');

  await page.goto('/ru');
  const viewport = page.viewportSize()!.height;

  // Третья карточка должна быть видна без прокрутки: шоурил её не выдавливает.
  const third = page.getByRole('main').getByRole('link', { name: /Production/ });
  const box = await third.boundingBox();
  expect(box!.y).toBeLessThan(viewport);
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

  // Каналы доступны и без окна: номер и ник можно просто скопировать.
  const direct = page.getByRole('link', { name: '+7 989 527 70 70' });
  await expect(direct.first()).toHaveAttribute('href', 'tel:+79895277070');
  await expect(page.getByRole('link', { name: '@Nik_Sokolov_pro' }).first()).toHaveAttribute(
    'href',
    'https://t.me/Nik_Sokolov_pro',
  );
});

test('кнопка «Связаться» открывает мессенджеры с готовым сообщением', async ({ page }) => {
  await page.goto('/ru/private/contact');
  await page.getByRole('button', { name: 'Связаться', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Все четыре канала, о которых договаривались, и все с рабочей ссылкой.
  // Регистр не проверяем: заглавные буквы даёт CSS, в разметке имя как в CMS.
  for (const [name, pattern] of [
    ['telegram', /^https:\/\/t\.me\//],
    ['max', /^https:\/\/max\.ru\//],
    ['whatsapp', /^https:\/\/wa\.me\//],
    ['sms', /^sms:/],
  ] as const) {
    await expect(dialog.getByRole('link', { name: new RegExp(name, 'i') })).toHaveAttribute(
      'href',
      pattern,
    );
  }
});

test('расчёт из калькулятора уезжает в сообщение мессенджера', async ({ page }) => {
  await page.goto('/ru/private/pricing');

  await page.getByText('Свадебная', { exact: true }).click();
  await page.getByText('Видео', { exact: true }).click();
  await page.locator('#calc-hours').fill('8');
  await page.getByRole('button', { name: 'Обсудить съёмку' }).click();

  const dialog = page.getByRole('dialog');
  // Ровно то, что человек видел на экране: тип, форматы, часы и сумма.
  await expect(dialog).toContainText('свадебная съёмка — фото и видео, 8 часов');
  await expect(dialog).toContainText('183 500');

  // Тот же текст должен уехать в чат, иначе подстановка бессмысленна.
  const href = await dialog.getByRole('link', { name: /telegram/i }).getAttribute('href');
  expect(decodeURIComponent(href ?? '')).toContain('фото и видео, 8 часов');
});

test('окно выбора мессенджера закрывается с клавиатуры', async ({ page }) => {
  await page.goto('/ru/private/contact');
  await page.getByRole('button', { name: 'Связаться', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('фоновое видео играет само, без звука и по кругу', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на узких экранах видео намеренно не грузится');

  await page.goto('/ru');
  // Именно фоновое видео: в карточках направлений есть свои.
  const video = page.locator('video[data-backdrop="showreel"]');
  await expect(video).toHaveCount(1);

  await page.waitForTimeout(1500);
  const state = await video.evaluate((el: HTMLVideoElement) => ({
    playing: !el.paused,
    muted: el.muted,
    loop: el.loop,
    inline: el.playsInline,
  }));

  expect(state).toEqual({ playing: true, muted: true, loop: true, inline: true });
});

test('на телефоне фон и видео карточки играют без всякого наведения', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильной подачи');

  await page.goto('/ru');
  await page.waitForTimeout(2500);

  const backdrop = page.locator('video[data-backdrop="showreel"]');
  await expect(backdrop).toHaveCount(1);
  await expect(backdrop).toHaveJSProperty('paused', false);

  // Вертикальное видео стоит внутри карточки и играет само: наведения нет (§5.1).
  const cardVideo = page.getByRole('main').getByRole('link', { name: /Private/ }).locator('video');
  await expect(cardVideo).toHaveCount(1);
  await expect(cardVideo).toHaveJSProperty('paused', false);
});

test('на телефоне видео занимает часть карточки, а не всю', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильной раскладки');

  await page.goto('/ru');
  const card = page.getByRole('main').getByRole('link', { name: /Private/ });
  const cardBox = (await card.boundingBox())!;
  const videoBox = (await card.locator('video').boundingBox())!;

  // Видео справа, текст слева — они не наезжают друг на друга.
  expect(videoBox.width).toBeLessThan(cardBox.width * 0.5);
  expect(videoBox.x).toBeGreaterThan(cardBox.x + cardBox.width * 0.5);
});

test('при уменьшенной анимации движения нет', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru');
  await page.waitForTimeout(1000);

  await expect(page.locator('video')).toHaveCount(0);
  // Кадр при этом остаётся: содержание не зависит от движения (§10).
  await expect(page.locator('img[src^="/media/"]').first()).toBeVisible();
});

test('карточка направления раскрывается при наведении и играет видео', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'наведения на touch-устройствах нет (§5.1)');

  await page.goto('/ru');
  const card = page.getByRole('main').getByRole('link', { name: /Private/ });

  const collapsed = (await card.boundingBox())!.height;
  // Файл подключается только при наведении: три ролика на старте были бы
  // мегабайтами впустую.
  await expect(card.locator('video')).toHaveJSProperty('currentSrc', '');

  await card.hover();
  await page.waitForTimeout(1200);

  const expanded = (await card.boundingBox())!.height;
  expect(expanded).toBeGreaterThan(collapsed * 1.5);

  const state = await card.locator('video').evaluate((el: HTMLVideoElement) => ({
    playing: !el.paused,
    muted: el.muted,
    loop: el.loop,
  }));
  expect(state).toEqual({ playing: true, muted: true, loop: true });

  // Соседняя карточка остаётся компактной.
  const other = page.getByRole('main').getByRole('link', { name: /Business/ });
  expect((await other.boundingBox())!.height).toBeCloseTo(collapsed, -1);
});

test('текст карточки доступен без наведения', async ({ page }) => {
  await page.goto('/ru');
  const card = page.getByRole('main').getByRole('link', { name: /Private/ });

  // Ни описание, ни ссылка не зависят от наведения (§5.1, §11).
  // Проверяем наличие описания, а не конкретную фразу: текст — дело
  // редактора, и правка формулировки не должна ронять тест.
  await expect(card).toHaveAttribute('href', '/ru/private');
  const description = (await card.innerText()).replace(/^01\s*Private\s*/i, '').replace('→', '');
  expect(description.trim().length).toBeGreaterThan(20);
});

test('видео карточки стартует при прокрутке к ней и встаёт на паузу за экраном', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильной подачи');

  await page.goto('/ru');
  await page.waitForTimeout(2000);

  const third = page.getByRole('main').getByRole('link', { name: /Production/ });
  // Браузер не запускает ролик, который при загрузке был за пределами экрана.
  await expect(third.locator('video')).toHaveJSProperty('paused', true);

  await third.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await expect(third.locator('video')).toHaveJSProperty('paused', false);

  // Ушедшая с экрана карточка не тратит батарею впустую. Прокручиваем до
  // конца страницы: после scrollIntoView первая карточка ещё видна краем.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  const first = page.getByRole('main').getByRole('link', { name: /Private/ });
  await expect(first.locator('video')).toHaveJSProperty('paused', true);
});

test('видеообложка PRIVATE показывается целиком и не обрезается', async ({ page }) => {
  await page.goto('/ru/private');
  await page.waitForTimeout(1500);

  const cover = page.locator('section video').first();
  await expect(cover).toHaveCount(1);

  const box = (await cover.boundingBox())!;
  const source = await cover.evaluate((el: HTMLVideoElement) => ({
    w: el.videoWidth,
    h: el.videoHeight,
  }));

  // Блок повторяет пропорции ролика — значит object-cover ничего не срезает.
  expect(box.width / box.height).toBeCloseTo(source.w / source.h, 1);

  // И занимает всю ширину страницы.
  const viewport = page.viewportSize()!.width;
  expect(box.width).toBeCloseTo(viewport, -1);
});

test('обложка играет без звука и по кругу', async ({ page }) => {
  await page.goto('/ru/private');
  await page.waitForTimeout(2000);

  const state = await page.locator('section video').first().evaluate((el: HTMLVideoElement) => ({
    playing: !el.paused,
    muted: el.muted,
    loop: el.loop,
  }));
  expect(state).toEqual({ playing: true, muted: true, loop: true });
});

test('при уменьшенной анимации обложка остаётся кадром', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/private');
  await page.waitForTimeout(1200);

  await expect(page.locator('section video')).toHaveCount(0);
  // Содержание не зависит от движения: кадр и заголовок на месте (§10).
  await expect(page.locator('img[src*="private-cover-poster"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('на телефоне текст обложки идёт под видео, а не поверх', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'проверка мобильной раскладки');

  await page.goto('/ru/private');
  await page.waitForTimeout(1500);

  const cover = (await page.locator('section video, img[src*="private-cover-poster"]').first().boundingBox())!;
  const heading = (await page.getByRole('heading', { level: 1 }).boundingBox())!;

  // Полоса высотой в пятую часть ширины не вместила бы подпись поверх себя.
  expect(heading.y).toBeGreaterThan(cover.y + cover.height - 4);
});

test('на главной ветки нет двух разделов с одинаковым заголовком', async ({ page }) => {
  for (const path of ['/ru/private', '/ru/business', '/ru/production']) {
    await page.goto(path);

    const headings = await page
      .locator('main section h2')
      .allInnerTexts()
      .then((items) => items.map((item) => item.trim()).filter(Boolean));

    // Два блока с одним названием — это либо дубль, либо два разных смысла
    // под одной вывеской. И то и другое сбивает с толку.
    expect(new Set(headings).size, `${path}: ${headings.join(' · ')}`).toBe(headings.length);
  }
});

test('на главной PRIVATE портфолио представлено категориями', async ({ page }) => {
  await page.goto('/ru/private');

  const portfolio = page.getByRole('heading', { name: 'Портфолио', exact: true });
  await expect(portfolio).toHaveCount(1);

  // Категории ведут в портфолио с уже выбранным фильтром.
  const section = portfolio.locator('xpath=ancestor::section');
  await expect(section.getByRole('link', { name: 'Свадьбы' })).toHaveAttribute(
    'href',
    /portfolio\?category=wedding/,
  );
});

/**
 * Жесты в полноэкранном просмотре. Playwright не умеет тянуть палец по экрану,
 * поэтому события касания отправляются вручную — так же, как их шлёт браузер.
 */
async function swipe(page: import('@playwright/test').Page, dx: number, dy: number) {
  await page.evaluate(
    async ([dx, dy]) => {
      const area = document.querySelector('dialog[open] .lightbox-frame')?.parentElement;
      if (!area) throw new Error('просмотр не открыт');
      const box = area.getBoundingClientRect();
      const x0 = box.left + box.width / 2;
      const y0 = box.top + box.height / 2;

      const send = (type: string, x: number, y: number) => {
        const touch = new Touch({ identifier: 1, target: area, clientX: x, clientY: y });
        const ended = type === 'touchend';
        area.dispatchEvent(
          new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: ended ? [] : [touch],
            targetTouches: ended ? [] : [touch],
            changedTouches: [touch],
          }),
        );
      };

      send('touchstart', x0, y0);
      for (let i = 1; i <= 6; i++) {
        send('touchmove', x0 + (dx * i) / 6, y0 + (dy * i) / 6);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      send('touchend', x0 + dx, y0 + dy);
    },
    [dx, dy],
  );
}

test('на телефоне свайп вниз закрывает полноэкранный просмотр', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'жест есть только на сенсорном экране');

  await page.goto('/ru/private/portfolio');
  const dialog = page.getByRole('dialog');

  await page.locator('main figure button').nth(3).click();
  await expect(dialog).toBeVisible();

  // Короткое движение — случайное: просмотр остаётся открытым.
  await swipe(page, 0, 50);
  await expect(dialog).toBeVisible();

  await swipe(page, 0, 160);
  await expect(dialog).toBeHidden();
});

test('на телефоне свайп вверх тоже закрывает просмотр', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'жест есть только на сенсорном экране');

  await page.goto('/ru/private/portfolio');
  const dialog = page.getByRole('dialog');

  await page.locator('main figure button').nth(3).click();
  await expect(dialog).toBeVisible();

  await swipe(page, 0, -50);
  await expect(dialog).toBeVisible();

  await swipe(page, 0, -160);
  await expect(dialog).toBeHidden();
});

test('на телефоне свайп в сторону листает кадры, а не закрывает', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'жест есть только на сенсорном экране');

  await page.goto('/ru/private/portfolio');
  await page.locator('main figure button').nth(3).click();

  const dialog = page.getByRole('dialog');
  const counter = dialog.locator('p').first();
  const before = await counter.textContent();

  await swipe(page, -140, 0);
  await expect(dialog).toBeVisible();
  await expect(counter).not.toHaveText(before ?? '');

  await swipe(page, 140, 0);
  await expect(counter).toHaveText(before ?? '');
});

test('смена кадра показывает, в какую сторону листают', async ({ page }) => {
  await page.goto('/ru/private/portfolio');
  await page.locator('main figure button').nth(2).click();

  const slide = page.locator('dialog[open] .lightbox-slide');
  // При открытии — только проявление: кадр ниоткуда не приезжает.
  await expect(slide).toHaveClass(/is-in/);

  await page.keyboard.press('ArrowRight');
  await expect(slide).toHaveClass(/is-next/);

  await page.keyboard.press('ArrowLeft');
  await expect(slide).toHaveClass(/is-prev/);
});

test('соседние кадры подгружаются заранее', async ({ page }) => {
  await page.goto('/ru/private/portfolio');

  // Считаем сами кадры, а не файлы: ширину выбирает браузер под свой экран.
  const requested = new Set<string>();
  page.on('request', (request) => {
    const file = /\/portfolio\/wedding\/([^/]+)-\d+\.jpg/.exec(request.url());
    if (file) requested.add(file[1]);
  });

  await page.locator('main figure button').nth(10).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Открытый кадр и оба соседа: без предзагрузки на перелистывании виден провал.
  await expect.poll(() => requested.size, { timeout: 5000 }).toBeGreaterThanOrEqual(3);
});

test('кадр в полноэкранном просмотре помещается на экран целиком', async ({ page }) => {
  await page.goto('/ru/private/portfolio');

  // Второй кадр горизонтальный, девятый вертикальный: обрезаться может любой.
  for (const index of [1, 8]) {
    await page.locator('main figure button').nth(index).click();

    const image = page.locator('dialog[open] .lightbox-slide img');
    await expect(image).toBeVisible();
    await image.evaluate(
      (element: HTMLImageElement) =>
        element.complete || new Promise((resolve) => element.addEventListener('load', resolve)),
    );

    const box = (await image.boundingBox())!;
    const view = page.viewportSize()!;
    // Округление браузера даёт доли пикселя — допуск в единицу.
    expect(box.y, `кадр ${index + 1} выходит вверх`).toBeGreaterThanOrEqual(-1);
    expect(box.y + box.height, `кадр ${index + 1} выходит вниз`).toBeLessThanOrEqual(view.height + 1);
    expect(box.x, `кадр ${index + 1} выходит влево`).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, `кадр ${index + 1} выходит вправо`).toBeLessThanOrEqual(view.width + 1);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  }
});

test('клик мимо кадра закрывает просмотр, по кадру и стрелкам — нет', async ({ page }) => {
  await page.goto('/ru/private/portfolio');
  const dialog = page.getByRole('dialog');

  await page.locator('main figure button').nth(8).click();
  await expect(dialog).toBeVisible();

  // Меряем только загруженный кадр: у недогруженного другие границы, и клик
  // «по центру» попадал мимо него.
  const image = page.locator('dialog[open] .lightbox-slide img');
  await image.evaluate(
    (element: HTMLImageElement) =>
      element.complete || new Promise((resolve) => element.addEventListener('load', resolve)),
  );
  const box = (await image.boundingBox())!;

  // Сам кадр закрывать не должен: по нему кликают, чтобы рассмотреть.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(dialog).toBeVisible();

  // Стрелка листает и оставляет просмотр открытым.
  const counter = dialog.locator('p').first();
  const before = await counter.textContent();
  await page.locator('.lightbox-arrow').last().click();
  await expect(dialog).toBeVisible();
  await expect(counter).not.toHaveText(before ?? '');

  // Пустое место в шапке — тоже поле вне кадра, и оно есть на любом экране.
  await page.mouse.click((page.viewportSize()!.width * 2) / 5, 20);
  await expect(dialog).toBeHidden();
});

test('на широком экране клик сбоку от кадра закрывает просмотр', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'на телефоне кадр занимает почти всю ширину');

  await page.goto('/ru/private/portfolio');
  const dialog = page.getByRole('dialog');

  // Девятый кадр вертикальный: по бокам от него остаётся широкое поле.
  await page.locator('main figure button').nth(8).click();
  await expect(dialog).toBeVisible();

  const image = page.locator('dialog[open] .lightbox-slide img');
  await image.evaluate(
    (element: HTMLImageElement) =>
      element.complete || new Promise((resolve) => element.addEventListener('load', resolve)),
  );
  const box = (await image.boundingBox())!;
  await page.mouse.click(box.x / 2, box.y + box.height / 2);
  await expect(dialog).toBeHidden();
});

test('с портфолио есть заметный переход к полным свадьбам', async ({ page }) => {
  await page.goto('/ru/private/portfolio');

  // Переход стоит до сетки: за полной съёмкой не нужно листать сотню кадров.
  const promo = page.getByRole('link', { name: /Открыть альбомы/ });
  await expect(promo).toBeVisible();
  const promoBox = (await promo.boundingBox())!;
  const firstFrame = (await page.locator('main figure button').first().boundingBox())!;
  expect(promoBox.y).toBeLessThan(firstFrame.y);

  await promo.click();
  await expect(page).toHaveURL(/\/ru\/private\/albums$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Полные свадьбы');
});

test('каждый альбом ведёт на свою галерею и с обложкой', async ({ page }) => {
  await page.goto('/ru/private/albums');

  const cards = page.locator('main ul li a');
  expect(await cards.count()).toBeGreaterThan(5);

  const links = await cards.evaluateAll((items) =>
    items.map((item) => (item as HTMLAnchorElement).href),
  );
  // Две карточки на одну галерею — верный признак опечатки в данных.
  expect(new Set(links).size).toBe(links.length);
  for (const link of links) expect(link).toMatch(/^https:\/\/lokos\.pro\/disk\//);

  // Обложка есть у каждого альбома. Проверяем разметку, а не загрузку: кадры
  // ниже экрана грузятся лениво, и это правильно.
  expect(await page.locator('main ul li img').count()).toBe(links.length);
  await expect(page.locator('main ul li img').first()).toHaveJSProperty('complete', true);
});

test('альбом ведёт на внешнюю галерею и говорит об этом', async ({ page }) => {
  await page.goto('/ru/private/albums');

  const album = page.getByRole('link', { name: /Марк и Екатерина/ });
  await expect(album).toHaveAttribute('href', /^https:\/\/lokos\.pro\/disk\//);
  // Уход на сторонний сервис не должен быть сюрпризом — ни глазами, ни на слух.
  await expect(album).toHaveAttribute('target', '_blank');
  await expect(album).toHaveAttribute('rel', /noopener/);
  await expect(album).toHaveAttribute('aria-label', /новой вкладке/);
});

test('полные свадьбы живут вне меню и только в private', async ({ page }, testInfo) => {
  await page.goto('/ru/private/portfolio');

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Открыть меню' }).click();
  }
  // В шапке раздела нет: на него ведёт переход с портфолио, а не пункт меню.
  await expect(page.locator('header').getByRole('link', { name: 'Полные свадьбы' })).toHaveCount(0);

  // Сама страница при этом открывается и лежит в карте сайта.
  expect((await page.goto('/ru/private/albums'))?.status()).toBe(200);
  const sitemap = await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/ru/private/albums');

  // У BUSINESS и PRODUCTION такого раздела нет — и адрес тоже не открывается.
  expect((await page.goto('/ru/business/albums'))?.status()).toBe(404);
});

test('у альбома есть обложка, и она не грузится в полном размере на телефоне', async ({ page }) => {
  await page.goto('/ru/private/albums');

  const cover = page.locator('main ul li img').first();
  await expect(cover).toBeVisible();
  // Обложка декоративна: имя пары уже есть в названии ссылки, дублировать незачем.
  await expect(cover).toHaveAttribute('alt', '');
  await expect(cover).toHaveAttribute('srcset', /600w/);
  await expect(cover).toHaveAttribute('srcset', /1200w/);
});

test('из полных свадеб можно вернуться в портфолио по пути, а не через меню', async ({ page }) => {
  await page.goto('/ru/private/albums');

  const path = page.getByRole('navigation', { name: 'Вы здесь' });
  await expect(path.getByRole('link')).toHaveText(['Главная', 'Портфолио']);

  await path.getByRole('link', { name: 'Портфолио' }).click();
  await expect(page).toHaveURL(/\/ru\/private\/portfolio$/);
});

test('переход к альбомам показывается только там, где полные серии бывают', async ({ page }) => {
  const promo = () => page.getByRole('link', { name: /Открыть альбомы/ });

  await page.goto('/ru/private/portfolio?category=wedding');
  await expect(promo()).toHaveCount(1);

  /*
   * У портрета и семьи полной выдачи одной съёмки не бывает — предлагать
   * нечего. У love story и частных событий она есть, но лежит тут же во
   * вкладке: переход увёл бы человека на страницу с одними свадьбами.
   */
  for (const category of ['portrait', 'family', 'love-story', 'private-event']) {
    await page.goto(`/ru/private/portfolio?category=${category}`);
    await expect(promo(), category).toHaveCount(0);
  }
});

test('большая галерея открывается порциями, а просмотр листает её целиком', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=portrait');

  const frames = page.locator('main figure button');
  const first = await frames.count();
  // Две сотни кадров сразу — это бесконечная страница без ориентиров.
  expect(first).toBeLessThan(60);

  const more = page.getByRole('button', { name: 'Показать ещё' });
  await more.click();
  expect(await frames.count()).toBeGreaterThan(first);

  // В полноэкранном просмотре доступны все кадры категории, а не только видимые.
  await frames.first().click();
  const counter = page.getByRole('dialog').locator('p').first();
  await expect(counter).toHaveText(new RegExp(`из \\d{3}`));
});

test('в галерее нет «Смотреть все», в списке работ есть', async ({ page }) => {
  await page.goto('/ru/private/portfolio');
  const filter = page.getByRole('navigation', { name: 'Фильтр' });
  // Свадьбы, портреты и семейные кадры вперемешку не складываются ни во что.
  await expect(filter.getByRole('link', { name: 'Смотреть все' })).toHaveCount(0);
  await expect(filter.getByRole('link', { name: 'Свадьбы' })).toBeVisible();

  // Список работ так и листают — подряд.
  await page.goto('/ru/business/cases');
  await expect(
    page.getByRole('navigation', { name: 'Фильтр' }).getByRole('link', { name: 'Смотреть все' }),
  ).toBeVisible();
});

test('страница не прокручивается дальше подвала @safari', async ({ page }) => {
  // Проверяется в Safari: его многоколоночная раскладка добавляла к высоте
  // страницы тысячи пикселей пустоты, которых не было ни у одного элемента.
  for (const path of ['/ru/private/portfolio', '/ru/private/portfolio?category=portrait']) {
    await page.goto(path);
    await page.waitForTimeout(600);

    const tail = await page.evaluate(() => {
      const footer = document.querySelector('footer')!.getBoundingClientRect();
      return document.documentElement.scrollHeight - Math.round(footer.bottom + window.scrollY);
    });
    expect(tail, path).toBeLessThanOrEqual(1);
  }
});

test('«Показать ещё» добавляет кадры вниз, не сдвигая показанные @safari', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=portrait');

  const frames = page.locator('main figure button');
  const positions = () =>
    frames.evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return `${Math.round(box.x)}:${Math.round(box.y + window.scrollY)}`;
      }),
    );

  const before = await positions();
  await page.getByRole('button', { name: 'Показать ещё' }).click();
  await expect(frames).not.toHaveCount(before.length);

  // Ни один уже показанный кадр не должен переехать: иначе они разбегаются
  // вверх и в середину, и человек их просто не замечает.
  const after = await positions();
  expect(after.slice(0, before.length)).toEqual(before);
});

test('портфолио свадеб делится на фото, видео и reels', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=wedding');

  const tabs = page.locator('main fieldset label');
  await expect(tabs).toHaveText([/Фото/i, /Видео/i, /Reels/i]);

  // По умолчанию фотографии: за ними приходят чаще.
  await expect(page.locator('main figure button')).not.toHaveCount(0);

  await page.getByText('Видео', { exact: true }).click();
  // Ролик не грузит плеер, пока человек не согласится: постер и кнопка.
  const film = page.locator('main figure').first();
  await expect(film.locator('img')).toBeVisible();
  await expect(film.getByRole('button')).toBeVisible();
});

test('вкладок нет там, где снят только один вид материала', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=portrait');
  // Переключать нечего — переключателя и не должно быть.
  await expect(page.locator('main fieldset label')).toHaveCount(0);
  await expect(page.locator('main figure button')).not.toHaveCount(0);
});

test('вертикальный ролик не растянут в горизонтальный @safari', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=wedding');
  await page.getByText('Reels', { exact: true }).click();

  const poster = page.locator('main figure img').first();
  await expect(poster).toBeVisible();
  // Постер вертикальный, и место под него резервируется в тех же пропорциях:
  // иначе при загрузке страница дёргается.
  const box = (await poster.boundingBox())!;
  expect(box.height).toBeGreaterThan(box.width);
});

test('love story показывается альбомами, а не отдельными кадрами', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=love-story');

  // Ни сетки кадров, ни переключателя вкладок: смотреть нечего по отдельности.
  await expect(page.locator('main figure')).toHaveCount(0);
  await expect(page.locator('main fieldset label')).toHaveCount(0);

  const album = page.getByRole('link', { name: /Иван и Александра/ });
  await expect(album).toHaveAttribute('href', /^https:\/\/lokos\.pro\/disk\//);
  await expect(album).toHaveAttribute('target', '_blank');
});

test('частные события показываются альбомами, а не отдельными кадрами', async ({ page }) => {
  await page.goto('/ru/private/portfolio?category=private-event');

  await expect(page.locator('main figure')).toHaveCount(0);
  await expect(page.locator('main fieldset label')).toHaveCount(0);

  const album = page.getByRole('link', { name: /Выпускной вечер/ });
  await expect(album).toHaveAttribute('href', /^https:\/\/lokos\.pro\/disk\//);
  await expect(album).toHaveAttribute('target', '_blank');
});

test('альбом категории не дублируется на странице полных серий', async ({ page }) => {
  await page.goto('/ru/private/albums');
  // Иначе один и тот же альбом попадался бы человеку дважды.
  await expect(page.getByRole('link', { name: /Иван и Александра/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Выпускной вечер/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Марк и Екатерина/ })).toHaveCount(1);
});

test('плитка категории показывает петлю при наведении и гасит её при уходе', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'наведения на сенсорном экране не бывает');

  await page.goto('/ru/private');
  const tile = page.getByRole('main').getByRole('link', { name: /^Свадьбы/ });
  const video = tile.locator('video');
  const grid = tile.locator('xpath=ancestor::ul[1]');

  /*
   * Отступы названий всех плиток от верха сетки. Берём их у самих плиток, а не
   * поиском по странице: те же слова встречаются в лиде и в заголовках статей,
   * и по ним проверка молча мерила бы чужой текст.
   */
  const names = ['Свадьбы', 'Портрет', 'Семья', 'Love story', 'Частные события'];
  const titleOffsets = async () => {
    const top = (await grid.boundingBox())!.y;
    const out: Record<string, number> = {};
    for (const name of names) {
      const title = grid
        .getByRole('link', { name: new RegExp(`^${name}`) })
        .getByText(name, { exact: true });
      out[name] = Math.round((await title.boundingBox())!.y - top);
    }
    return out;
  };

  const before = (await tile.boundingBox())!;
  const gridHeight = (await grid.boundingBox())!.height;
  const offsets = await titleOffsets();
  expect(Object.keys(offsets)).toHaveLength(5);

  /*
   * До наведения адрес не подставлен: пять роликов не должны ехать за
   * человеком по сети, пока он на них не посмотрел.
   */
  await expect(video).toHaveAttribute('poster', /category-wedding-poster/);
  await expect(video).not.toHaveAttribute('src', /./);

  await tile.hover();
  await expect(video).toHaveAttribute('src', /category-wedding-loop\.mp4$/);
  await expect(video).toHaveJSProperty('paused', false);
  // Кадр действительно идёт, а не просто «не на паузе».
  await expect
    .poll(async () => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);

  // Название читается поверх кадра — ради него всё и затемняется.
  await expect(tile.getByText('Свадьбы')).toBeVisible();

  /*
   * Плитка раскрылась под кадр: её пропорции повторяют пропорции ролика,
   * значит object-cover ничего не срезал и кадр виден целиком.
   */
  const source = await video.evaluate((el: HTMLVideoElement) => el.videoWidth / el.videoHeight);
  /*
   * Раскрывается слой с кадром, а не сама плитка, поэтому меряем его. Ждём,
   * пока пропорции встанут: анимация длится доли секунды, и первый попавшийся
   * кадр анимации ещё ничего не значит.
   */
  const panel = video.locator('xpath=..');
  await expect
    .poll(async () => {
      const box = (await panel.boundingBox())!;
      return box.width / box.height;
    })
    .toBeCloseTo(source, 1);

  expect((await panel.boundingBox())!.height).toBeGreaterThan(before.height * 3);

  /*
   * И при этом ни одно название не сдвинулось: плитка растёт вниз, а строка
   * остаётся там, где человек её прочитал. Считаем от сетки — страница ниже
   * действительно уезжает, а вот текст внутри сетки стоять обязан.
   */
  expect(await titleOffsets()).toEqual(offsets);

  /*
   * И сама сетка не выросла: кадр раскрывается слоем поверх страницы. Иначе
   * строка сетки тянула бы за собой всё, что ниже, — нижний ряд плиток уезжал
   * вниз на шестьсот с лишним пикселей.
   */
  expect((await grid.boundingBox())!.height).toBeCloseTo(gridHeight, 0);

  // Уводим мышь: ролик встаёт и отматывается назад, иначе в следующий раз
  // он продолжится с середины.
  await page.getByRole('heading', { level: 1 }).hover();
  await expect(video).toHaveJSProperty('paused', true);
  await expect(video).toHaveJSProperty('currentTime', 0);
});

test('при отключённом движении петли категорий не грузятся вовсе', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'наведения на сенсорном экране не бывает');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ru/private');

  const tile = page.getByRole('main').getByRole('link', { name: /^Свадьбы/ });
  await tile.hover();

  // Ни ролика, ни запроса за ним. Плитка остаётся обычной ссылкой.
  await expect(tile.locator('video')).toHaveCount(0);
  await expect(tile).toHaveAttribute('href', /\?category=wedding$/);
  await expect(tile.getByText('Свадьбы')).toBeVisible();
});

test('к пакетам ведёт кнопка, а не строчка сбоку', async ({ page }) => {
  await page.goto('/ru/private');

  const pricing = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Стоимость' }) })
    .first();

  const button = pricing.getByRole('link', { name: 'Пакетные предложения' });
  await expect(button).toHaveAttribute('href', '/ru/private/pricing');
  // Прежней неприметной строчки здесь больше нет.
  await expect(pricing.getByRole('link', { name: 'Смотреть все' })).toHaveCount(0);

  /*
   * Это кнопка, а не текст: у неё своя заливка и высота под палец. Меряем
   * заливку, а не класс — класс можно переименовать, не тронув вид.
   */
  const box = (await button.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThan(150);
  await expect(button).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('последний час считается по всем выбранным форматам', async ({ page }) => {
  await page.goto('/ru/private');

  const pricing = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Стоимость' }) })
    .first();
  const rate = async () => {
    const text = await pricing.innerText();
    const found = text.match(/ПОСЛЕДНИЙ ЧАС\s*—\s*([\d\s  ]+)₽/i)?.[1];
    return found ? Number(found.replace(/\D/g, '')) : null;
  };
  const toggle = (name: string) =>
    pricing.getByRole('checkbox', { name, exact: true }).click({ force: true });

  // По умолчанию выбрано фото.
  const photo = (await rate())!;
  expect(photo).toBeGreaterThan(0);

  await toggle('Видео');
  const both = (await rate())!;

  await toggle('Фото');
  const video = (await rate())!;

  /*
   * Раньше здесь всегда стояла фотоставка: при «фото и видео» цифра была
   * почти вдвое ниже настоящей. Час двух форматов дороже часа любого из них.
   */
  expect(video).not.toBe(photo);
  expect(both).toBeGreaterThan(photo);
  expect(both).toBeGreaterThan(video);
});

test('на странице стоимости сначала ставки, калькулятор в конце', async ({ page }) => {
  await page.goto('/ru/private/pricing');

  const top = async (locator: ReturnType<typeof page.getByText>) =>
    (await locator.first().boundingBox())!.y;

  const rates = await top(page.getByText('Час работы', { exact: true }));
  const packages = await top(page.getByRole('heading', { name: 'Пакетные предложения' }));
  const calculator = await top(page.getByRole('heading', { name: 'Посчитать стоимость' }));

  /*
   * Человек приходит сюда за ставкой. Раньше первым стоял калькулятор, и
   * чтобы её узнать, приходилось выводить цифру из суммы, двигая ползунок.
   */
  expect(rates).toBeLessThan(packages);
  expect(packages).toBeLessThan(calculator);

  // Ставки названы прямо и совпадают с теми, по которым считает калькулятор.
  const rate = (role: string) =>
    page.locator('dt', { hasText: new RegExp(`^${role}$`) }).locator('xpath=following-sibling::dd[1]');
  await expect(rate('Фотограф')).toHaveText(/12\s?000/);
  await expect(rate('Видеограф')).toHaveText(/15\s?000/);

  // Это самая крупная строка на странице — крупнее её заголовка.
  const size = async (locator: ReturnType<typeof page.getByText>) =>
    Number((await locator.first().evaluate((el) => getComputedStyle(el).fontSize)).replace('px', ''));
  expect(await size(rate('Фотограф'))).toBeGreaterThan(
    await size(page.getByRole('heading', { level: 1 })),
  );
});
