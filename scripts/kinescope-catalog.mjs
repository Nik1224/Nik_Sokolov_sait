/**
 * Выгрузка каталога роликов с Kinescope в content/kinescope-catalog.json.
 *
 * Берутся только метаданные: идентификатор для встраивания, название, папка,
 * длительность, кадр, адрес постера. Сами файлы не скачиваются — ролики живут
 * на сервисе, а не в репозитории (README, раздел про Backstage).
 *
 * Запуск: KINESCOPE_API_TOKEN=<токен> node scripts/kinescope-catalog.mjs
 */

import { writeFile } from 'node:fs/promises';

const API = 'https://api.kinescope.io/v1';
const OUT = new URL('../content/kinescope-catalog.json', import.meta.url);
const PER_PAGE = 100;

/*
 * Токен можно не давать скрипту вовсе.
 *
 * Если переменная задана — подписываем запрос сами. Если нет — уходим без
 * заголовка: его подставит шлюз, когда ключ хранится на стороне среды. Второй
 * путь безопаснее, потому что ключ не попадает ни в переменные окружения, ни в
 * вывод команд, ни на глаза тому, кто запускает скрипт.
 */
const token = process.env.KINESCOPE_API_TOKEN;

async function get(path, params = {}) {
  const url = new URL(API + path);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    /*
     * Про отсутствующий ключ Kinescope отвечает не только 401, но и 400 с
     * текстом «authorization header not found». Голый код ответа тут сбивает
     * с толку, поэтому разбираем и говорим человеческим языком.
     */
    const body = await response.text();
    if (/authorization|unauthorized|forbidden/i.test(body) || [401, 403].includes(response.status)) {
      console.error(
        'Kinescope не пустил: ключа нет.\n' +
          'Либо задайте KINESCOPE_API_TOKEN, либо пропишите ключ для api.kinescope.io\n' +
          'на стороне среды, чтобы его подставлял шлюз и скрипт его не видел.\n' +
          'Токен выпускается в кабинете: настройки рабочей зоны → API-токены.',
      );
      process.exit(1);
    }
    throw new Error(`${response.status} ${url.pathname}${url.search}: ${body}`);
  }
  return response.json();
}

/** Все страницы разом: у списков пагинация по page/per_page, общее число в meta. */
async function getAll(path, params = {}) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const body = await get(path, { ...params, page, per_page: PER_PAGE });
    items.push(...body.data);
    if (items.length >= (body.meta?.pagination?.total ?? items.length)) return items;
  }
}

/**
 * Короткий идентификатор ролика. Именно он идёт в поле videoId схемы медиа и
 * превращается в адрес плеера функцией embedUrl из lib/media.ts. UUID из поля
 * id для встраивания не годится.
 */
function videoIdOf(video) {
  const match = /\/embed\/([^/?#]+)/.exec(video.embed_link ?? '');
  return match?.[1] ?? null;
}

/** Кадр исходника: по нему видно, горизонтальный ролик или вертикальный. */
function resolutionOf(video) {
  const assets = video.assets ?? [];
  return (assets.find((asset) => asset.quality === 'original') ?? assets.at(-1))?.resolution ?? null;
}

/**
 * Личные проекты владельца и его архив: на сайт не идут, выгружать их незачем. Сравнение
 * идёт без учёта регистра — в кабинете названия правятся руками.
 */
const EXCLUDED = new Set(['свадьба моя', 'макс терских', 'евгений терешин', 'архив']);

const projects = (await getAll('/projects')).filter(
  (project) => !EXCLUDED.has(project.name.trim().toLowerCase()),
);

const categories = [];
for (const project of projects) {
  const videos = await getAll('/videos', { project_id: project.id });
  categories.push({
    name: project.name,
    count: videos.length,
    videos: videos
      .map((video) => ({
        title: video.title,
        videoId: videoIdOf(video),
        embed: video.embed_link,
        watch: video.play_link,
        durationSeconds: video.duration == null ? null : Math.round(video.duration * 100) / 100,
        resolution: resolutionOf(video),
        // Постер сервиса — первый кадр ролика. На сайт он не идёт (README),
        // но по нему удобно опознать ролик, не открывая кабинет.
        poster: video.poster?.original ?? null,
        createdAt: video.created_at,
        kinescopeId: video.id,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'ru')),
  });
}

categories.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ru'));

const total = categories.reduce((sum, category) => sum + category.count, 0);
await writeFile(
  OUT,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      source: 'Kinescope API v1, GET /v1/projects + /v1/videos',
      total,
      categories,
    },
    null,
    2,
  )}\n`,
);

const missing = categories.flatMap((c) => c.videos.filter((v) => !v.videoId).map((v) => `${c.name} / ${v.title}`));
if (missing.length) console.warn(`Без идентификатора для встраивания: ${missing.join(', ')}`);
console.log(`${total} роликов в ${categories.length} категориях → content/kinescope-catalog.json`);
