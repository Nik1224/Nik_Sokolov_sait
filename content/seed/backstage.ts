/**
 * Бэкстейдж со свадебных съёмок.
 *
 * Ролики живут на Kinescope, а не файлами на своём домене, и это осознанно: это
 * не короткие немые петли вроде обложек категорий, а фильмы по три-четыре
 * минуты со звуком. Класть их в репозиторий — плюс полсотни мегабайт к каждой
 * сборке навсегда, без перемотки и без подстройки под скорость сети.
 *
 * Порядок важен: первым идёт тот ролик, который показывается на Home. Там с
 * каждой категории берётся один — выложить все значит утопить каждый, человек
 * посмотрит первый и уйдёт. На визитке, наоборот, показываются все: её
 * открывает пара, которая уже решает, и ей нужно насмотреться.
 *
 * Постеры сняты с исходников на своей машине, а не взяты у сервиса: тот
 * подставляет первый кадр, а это обычно пустой зал или размытие. Секунда у
 * каждого записана рядом — чтобы поменять кадр, не разбирая ролик заново.
 */

import type { MediaAsset } from '../types';

const WIDTHS = [600, 1200, 1800] as const;

/**
 * Ролик бэкстейджа с постером.
 *
 * В имени файла постера стоит длинная сторона, а srcset требует ширину: у
 * горизонтального ролика это одно и то же число, у вертикального — нет.
 * Поэтому ширина считается из пропорций, а не берётся из имени.
 */
function clip(
  id: string,
  videoId: string,
  poster: { width: number; height: number; sizes: number[] },
  ru: string,
  en: string,
): MediaAsset {
  const base = '/media/backstage';
  const largest = poster.sizes[poster.sizes.length - 1];
  const longest = Math.max(poster.width, poster.height);
  const widthOf = (size: number) => Math.round((size * poster.width) / longest);

  return {
    _key: `bs-${id}`,
    type: 'video',
    provider: 'kinescope',
    videoId,
    rights: 'owned',
    alt: { ru, en },
    poster: {
      src: `${base}/bs-${id}-${largest}.jpg`,
      width: poster.width,
      height: poster.height,
      sources: poster.sizes.map((size) => ({
        width: widthOf(size),
        src: `${base}/bs-${id}-${size}.jpg`,
      })),
    },
  };
}

export const weddingBackstage: MediaAsset[] = [
  clip(
    '245d4947',
    '245d4947-ce5f-45c9-a2e0-f3d36cc94d77',
    // Кадр на 82-й секунде. Первый в списке — он и уходит на Home.
    { width: 1013, height: 1800, sizes: [...WIDTHS] },
    'Бэкстейдж со свадебной съёмки',
    'Backstage from a wedding shoot',
  ),
  clip(
    '0077daf9',
    '0077daf9-901d-4636-876d-8f800b66a6f8',
    // Кадр на 55-й секунде.
    { width: 1013, height: 1800, sizes: [...WIDTHS] },
    'Бэкстейдж со свадебной съёмки',
    'Backstage from a wedding shoot',
  ),
  clip(
    '6f4b4b3f',
    '6f4b4b3f-fac6-4e15-85f9-7a366d853e8f',
    /*
     * Кадр на 68-й секунде. Выше 1200 постера нет: исходник снят в 720×1280,
     * и растягивать его до 1800 — это лишние байты без единой лишней детали.
     */
    { width: 675, height: 1200, sizes: [600, 1200] },
    'Бэкстейдж со свадебной съёмки',
    'Backstage from a wedding shoot',
  ),
  clip(
    'efca7c37',
    'efca7c37-036f-40d2-a9ad-2803556e0c9e',
    // Кадр на 33-й секунде. Единственный горизонтальный ролик из четырёх.
    { width: 1800, height: 1013, sizes: [...WIDTHS] },
    'Бэкстейдж со свадебной съёмки',
    'Backstage from a wedding shoot',
  ),
];
