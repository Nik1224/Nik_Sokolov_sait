/**
 * Работа с изображениями (ТЗ §10).
 *
 * Размеры известны всегда, поэтому места под картинку резервируется ровно
 * столько, сколько нужно — заметного CLS не возникает (§17).
 */

import type { ImageRef } from '@/content/types';

/** Ширины для srcset. Покрывают мобильные до 2× ретины на десктопе. */
export const IMAGE_WIDTHS = [480, 768, 1024, 1440, 1920, 2560] as const;

function isSanityAsset(src: string): boolean {
  return src.includes('cdn.sanity.io');
}

/**
 * Локальные кадры лежат в WebP, а в данных по-прежнему записаны как `.jpg`.
 *
 * Подмена делается здесь, в одном месте, а не переписыванием восьмисот с
 * лишним путей по всем файлам данных: имя кадра — это его опознавательный
 * знак, он встречается в картах категорий, в ручных подборках и в
 * исключениях, и менять расширение во всех этих списках значило бы
 * расклеивать то, что сейчас сходится по имени.
 *
 * Выигрыш замерен на всей библиотеке: 202 МБ в JPEG против 143 в WebP при
 * неотличимой на глаз картинке. Это не перекладывание в другой контейнер, а
 * честное пережатие другим кодеком с качеством 82; пережатие в тот же JPEG
 * пробовалось и дало всего 7%, потому что кадры уже были сжаты грамотно.
 *
 * Одно исключение: превью ссылки в мессенджерах. Там нужен JPEG, и подмена
 * не применяется — см. `socialImage` ниже.
 */
export function localSrc(src: string): string {
  if (isSanityAsset(src) || !src.endsWith('.jpg')) return src;
  return src.replace(/\.jpg$/, '.webp');
}

/**
 * URL нужной ширины. Sanity CDN сам отдаёт AVIF/WebP по Accept-заголовку
 * (`auto=format`), у локальных файлов варианты пережаты заранее и перечислены
 * в `sources`. Всё остальное отдаётся как есть.
 */
export function imageSrc(image: ImageRef, width?: number): string {
  if (isSanityAsset(image.src)) {
    const params = new URLSearchParams({ auto: 'format', fit: 'max', q: '78' });
    if (width) params.set('w', String(width));
    return `${image.src}?${params.toString()}`;
  }

  if (image.sources?.length && width) {
    // Берём ближайший вариант не меньше запрошенного: кадр, растянутый из
    // меньшего файла, на ретине выглядит мылом.
    const sorted = [...image.sources].sort((a, b) => a.width - b.width);
    return localSrc((sorted.find((item) => item.width >= width) ?? sorted[sorted.length - 1]).src);
  }

  return localSrc(image.src);
}

/**
 * Кадр для превью ссылки в мессенджерах и соцсетях — всегда JPEG.
 *
 * На самом сайте тот же кадр отдаётся в WebP, и дело не в том, что для
 * превью не жалко веса. Превью собирают не браузеры, а сборщики ссылок, и
 * WebP у них поддержан вразнобой: часть разворачивает его в картинку, часть
 * молча отдаёт ссылку голым текстом. Связь на этом сайте идёт через
 * мессенджеры — ссылка без картинки дороже сэкономленных килобайт.
 *
 * Поэтому путь здесь не прогоняется через `localSrc`: у кадров, попадающих
 * в превью, рядом лежит JPEG-двойник. Что он на месте, следит
 * `tests/unit/content.test.ts` — иначе мессенджер покажет пустоту, а по
 * странице этого не видно.
 *
 * Sanity просим про JPEG прямо (`fm=jpg`), а не через `auto=format`: формат
 * по `Accept` сборщику ссылок достанется какой придётся.
 *
 * Размеры возвращаются настоящие, а не «1200×630 для всех»: по ним клиент
 * размечает место под картинку до того, как её скачает, и у вертикального
 * портрета, объявленного горизонтальным, превью разъезжается.
 */
export function socialImage(
  image: ImageRef,
  width = 1200,
): { url: string; width?: number; height?: number } {
  const ratio = aspectRatio(image);
  const sized = (url: string, w?: number) => ({
    url,
    width: w,
    height: w && ratio ? Math.round(w / ratio) : undefined,
  });

  if (isSanityAsset(image.src)) {
    const params = new URLSearchParams({
      fm: 'jpg',
      fit: 'max',
      q: '80',
      w: String(width),
    });
    return sized(`${image.src}?${params.toString()}`, width);
  }

  if (image.sources?.length) {
    const sorted = [...image.sources].sort((a, b) => a.width - b.width);
    const pick = sorted.find((item) => item.width >= width) ?? sorted[sorted.length - 1];
    return sized(pick.src, pick.width);
  }

  return sized(image.src, image.width);
}

export function imageSrcSet(image: ImageRef): string | undefined {
  if (isSanityAsset(image.src)) {
    return IMAGE_WIDTHS.filter((width) => width <= (image.width || Infinity) * 2)
      .map((width) => `${imageSrc(image, width)} ${width}w`)
      .join(', ');
  }

  if (!image.sources?.length) return undefined;
  return image.sources
    .map((item) => `${localSrc(item.src)} ${item.width}w`)
    .join(', ');
}

/**
 * Позиция кадрирования из focal point. Без неё смысловой центр уезжает
 * при обрезке под другое соотношение сторон.
 */
export function objectPosition(image: ImageRef): string {
  const { focalPoint } = image;
  if (!focalPoint) return '50% 50%';
  return `${(focalPoint.x * 100).toFixed(1)}% ${(focalPoint.y * 100).toFixed(1)}%`;
}

export function aspectRatio(image: ImageRef): number | undefined {
  if (!image.width || !image.height) return undefined;
  return image.width / image.height;
}

/** Ссылка на встроенный плеер стороннего сервиса (грузится только по согласию). */
export function embedUrl(provider: string, videoId: string): string | null {
  if (provider === 'kinescope') {
    return `https://kinescope.io/embed/${encodeURIComponent(videoId)}?autoplay=1`;
  }
  if (provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  }
  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1`;
  }
  return null;
}

export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/** ISO 8601 для JSON-LD VideoObject (§12). */
export function isoDuration(seconds: number | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  return `PT${Math.floor(seconds / 60)}M${Math.round(seconds % 60)}S`;
}
