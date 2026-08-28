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
  await page.goto('/ru/private/portfolio?category=portrait');
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
