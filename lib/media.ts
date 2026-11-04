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
 * Тот же кадр в JPEG весил в полтора раза больше при неотличимой картинке:
 * 223 МБ против 138 на всей библиотеке. Качество не тронуто — пережат только
 * контейнер.
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
